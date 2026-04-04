// backend/src/socket.js
const { Server } = require('socket.io');
const { prisma } = require('./db/prisma');

// active duel timers to clear them if needed
const duelTimers = new Map();

function setupSocketIO(server, corsOrigins) {
  const io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (corsOrigins.includes('*')) return callback(null, true);
        if (corsOrigins.some((o) => o === origin)) return callback(null, true);
        return callback(null, false);
      },
      credentials: true,
    }
  });

  io.on('connection', (socket) => {
    // ----- TEACHER EVENTS -----
    
    // Teacher joins their control room for a specific duel
    socket.on('duel:teacher-join', ({ duelId }) => {
      socket.join(`duel:${duelId}:teacher`);
    });

    socket.on('duel:start', async ({ duelId }) => {
      try {
        await prisma.duel.update({
          where: { id: duelId },
          data: { status: 'ACTIVE', startedAt: new Date() }
        });

        // Get duel to know classId to notify all students
        const duel = await prisma.duel.findUnique({
          where: { id: duelId },
          include: { questions: true }
        });

        if (!duel) return;

        io.to(`duel:${duelId}`).emit('duel:started', {
          duel: { id: duel.id, title: duel.title },
          totalQuestions: duel.questions.length
        });
      } catch (err) {
        console.error('[duel:start] error', err);
      }
    });

    socket.on('duel:next-question', async ({ duelId }) => {
      try {
        const duel = await prisma.duel.findUnique({
          where: { id: duelId },
          include: { questions: { orderBy: { order: 'asc' } } }
        });
        
        if (!duel) return;
        
        const nextQIndex = duel.currentQ;
        if (nextQIndex >= duel.questions.length) {
          // No more questions
          return;
        }

        const nextQ = duel.questions[nextQIndex];

        await prisma.duel.update({
          where: { id: duelId },
          data: { 
            status: 'QUESTION_ACTIVE', 
            currentQ: nextQIndex + 1 
          }
        });

        // Send to students (without correct index)
        io.to(`duel:${duelId}`).emit('duel:question', {
          question: {
            id: nextQ.id,
            questionText: nextQ.questionText,
            options: nextQ.options,
          },
          timeLimit: nextQ.timeLimit,
          qNumber: nextQIndex + 1
        });

        // Start timer auto-reveal
        const timer = setTimeout(async () => {
          autoEndQuestion(duelId, nextQ);
        }, nextQ.timeLimit * 1000);

        duelTimers.set(nextQ.id, timer);

      } catch (err) {
        console.error('[duel:next-question] error', err);
      }
    });

    socket.on('duel:end', async ({ duelId }) => {
      await endDuel(duelId);
    });

    // ----- STUDENT EVENTS -----

    socket.on('duel:join', async ({ duelId, studentId, studentName }) => {
      try {
        socket.join(`duel:${duelId}`);
        
        // ensure session exists
        await prisma.duelSession.upsert({
          where: { duelId_studentId: { duelId, studentId } },
          create: { duelId, studentId, totalScore: 0 },
          update: {} // do nothing if already exists
        });

        const numJoined = io.sockets.adapter.rooms.get(`duel:${duelId}`)?.size || 0;
        
        socket.emit('duel:joined', { totalJoined: numJoined, duelTitle: "Knowledge Duel" });
        
        // Notify teacher
        io.to(`duel:${duelId}:teacher`).emit('duel:student-joined', {
          studentId, name: studentName, totalJoined: numJoined
        });
      } catch (err) {
        console.error('[duel:join] error', err);
      }
    });

    socket.on('duel:answer', async ({ duelId, studentId, questionId, answerIndex, timeToAnswer }) => {
      try {
        const question = await prisma.duelQuestion.findUnique({ where: { id: questionId } });
        if (!question) return;

        const session = await prisma.duelSession.findUnique({
          where: { duelId_studentId: { duelId, studentId } }
        });
        if (!session) return;

        const isCorrect = (answerIndex === question.correctIndex);
        
        let pointsEarned = 0;
        if (isCorrect) {
          const speedBonus = Math.max(0, question.timeLimit - timeToAnswer);
          pointsEarned = question.points + Math.floor(speedBonus * 0.5); 
        }

        await prisma.duelAnswer.upsert({
          where: { sessionId_questionId: { sessionId: session.id, questionId } },
          create: {
            sessionId: session.id,
            questionId,
            answerIndex,
            isCorrect,
            timeToAnswer,
            pointsEarned
          },
          update: {
            answerIndex, isCorrect, timeToAnswer, pointsEarned
          }
        });

        const answersCount = await prisma.duelAnswer.count({
          where: { questionId }
        });
        
        const sessionsCount = await prisma.duelSession.count({
          where: { duelId }
        });

        io.to(`duel:${duelId}:teacher`).emit('duel:answer-received', {
          totalAnswered: answersCount,
          totalStudents: sessionsCount,
          answerIndex, 
          isCorrect
        });

        if (answersCount >= sessionsCount) {
          // Everyone answered
          if (duelTimers.has(question.id)) {
            clearTimeout(duelTimers.get(question.id));
            duelTimers.delete(question.id);
          }
          autoEndQuestion(duelId, question);
        }

      } catch (err) {
        console.error('[duel:answer] error', err);
      }
    });
  });

  async function autoEndQuestion(duelId, question) {
    try {
      await prisma.duel.update({
        where: { id: duelId },
        data: { status: 'SHOWING_RESULTS' }
      });

      const answers = await prisma.duelAnswer.findMany({
        where: { questionId: question.id },
        include: { session: { include: { student: { include: { user: true } } } } }
      });

      let dist = Array(Array.isArray(question.options) ? question.options.length : 4).fill(0);
      answers.forEach(a => {
        if (a.answerIndex >= 0 && a.answerIndex < dist.length) {
          dist[a.answerIndex]++;
        }
      });

      for (const a of answers) {
        await prisma.duelSession.update({
          where: { id: a.sessionId },
          data: { totalScore: { increment: a.pointsEarned } }
        });
      }

      const topSessions = await prisma.duelSession.findMany({
        where: { duelId },
        orderBy: { totalScore: 'desc' },
        take: 5,
        include: { student: { include: { user: true } } }
      });

      const leaderboard = topSessions.map((s, i) => ({
        rank: i + 1,
        name: s.student.user.name,
        totalScore: s.totalScore
      }));

      io.to(`duel:${duelId}`).emit('duel:question-result', {
        correctIndex: question.correctIndex,
        answerDistribution: dist,
        leaderboard
      });
      io.to(`duel:${duelId}:teacher`).emit('duel:question-result', {
        correctIndex: question.correctIndex,
        answerDistribution: dist,
        leaderboard
      });
    } catch(e) { console.error('[autoEndQuestion] error', e); }
  }

  async function endDuel(duelId) {
    try {
      await prisma.duel.update({
        where: { id: duelId },
        data: { status: 'ENDED', endedAt: new Date() }
      });

      const sessions = await prisma.duelSession.findMany({
        where: { duelId },
        orderBy: { totalScore: 'desc' },
        include: { student: { include: { user: true } } }
      });

      sessions.forEach(async (s, i) => {
        await prisma.duelSession.update({
          where: { id: s.id },
          data: { rank: i + 1 }
        });
      });

      io.to(`duel:${duelId}`).emit('duel:ended');
      io.to(`duel:${duelId}:teacher`).emit('duel:ended');
    } catch(e) { console.error('[endDuel] error', e); }
  }

  return io;
}

module.exports = { setupSocketIO };

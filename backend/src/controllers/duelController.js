const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create Duel
exports.createDuel = async (req, res, next) => {
  try {
    const { classId, subjectId, title, questions } = req.body;
    const teacherId = req.user.id;

    if (!classId || !title || !questions || !questions.length) {
      return res.status(400).json({ success: false, message: 'classId, title, and questions are required' });
    }

    const newDuel = await prisma.duel.create({
      data: {
        classId,
        subjectId,
        teacherId,
        title,
        status: 'WAITING',
        questions: {
          create: questions.map((q, index) => ({
            order: index,
            questionText: q.text || q.questionText,
            options: q.options || [],
            correctIndex: q.correctIndex || 0,
            timeLimit: q.timeLimit || 30,
            points: q.points || 10
          }))
        }
      },
      include: {
        questions: true
      }
    });

    res.status(201).json({
      success: true,
      data: {
        duel: newDuel,
        joinCode: newDuel.id.slice(0, 6).toUpperCase() // requested by user design
      }
    });

  } catch (error) {
    next(error);
  }
};

// Get Duel Results
exports.getDuelResults = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const duel = await prisma.duel.findUnique({
      where: { id },
      include: {
        questions: { orderBy: { order: 'asc' } },
        class: true
      }
    });

    if (!duel) {
      return res.status(404).json({ success: false, message: 'Duel not found' });
    }

    const sessions = await prisma.duelSession.findMany({
      where: { duelId: id },
      include: {
        student: { include: { user: true } },
        answers: true
      },
      orderBy: { totalScore: 'desc' }
    });

    const leaderboard = sessions.map(s => {
      const correctAnswers = s.answers.filter(a => a.isCorrect).length;
      const avgTimeToAnswer = s.answers.length > 0
        ? (s.answers.reduce((acc, a) => acc + a.timeToAnswer, 0) / s.answers.length).toFixed(1)
        : 0;

      return {
        studentId: s.studentId,
        name: s.student.user.name,
        totalScore: s.totalScore,
        rank: s.rank,
        correctAnswers,
        avgTimeToAnswer: parseFloat(avgTimeToAnswer)
      };
    });

    const allAnswers = await prisma.duelAnswer.findMany({
      where: { question: { duelId: id } }
    });

    const confusionHeatmap = duel.questions.map(q => {
      const qAnswers = allAnswers.filter(a => a.questionId === q.id);
      const totalA = qAnswers.length;
      const correctA = qAnswers.filter(a => a.isCorrect).length;
      
      const dist = Array(q.options.length).fill(0);
      qAnswers.forEach(a => {
        if (a.answerIndex >= 0 && a.answerIndex < dist.length) dist[a.answerIndex]++;
      });
      const mostChosen = dist.indexOf(Math.max(...dist));

      const avgT = totalA > 0 ? (qAnswers.reduce((acc, a) => acc + a.timeToAnswer, 0) / totalA).toFixed(1) : 0;

      return {
        questionId: q.id,
        questionText: q.questionText,
        options: q.options,
        correctIndex: q.correctIndex,
        totalAnswers: totalA,
        correctRate: totalA > 0 ? ((correctA / totalA) * 100).toFixed(1) : 0,
        avgTimeToAnswer: parseFloat(avgT),
        mostChosen,
        distribution: dist
      };
    });

    let myResult = null;
    if (req.user && req.user.role === 'STUDENT') {
      const mySession = sessions.find(s => s.student.userId === req.user.id);
      if (mySession) {
        myResult = {
          score: mySession.totalScore,
          rank: mySession.rank,
          answers: mySession.answers
        };
      }
    }

    res.json({
      success: true,
      data: {
        duel,
        leaderboard,
        confusionHeatmap,
        ...(myResult && { myResult })
      }
    });

  } catch (error) {
    next(error);
  }
};

// Get Past Duels
exports.getClassDuels = async (req, res, next) => {
  try {
    const { classId } = req.params;
    
    const duels = await prisma.duel.findMany({
      where: { classId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { sessions: true } }
      }
    });

    res.json({ success: true, data: duels });

  } catch(error) {
    next(error);
  }
};

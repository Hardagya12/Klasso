'use strict';

const { sendSuccess, sendError } = require('../utils/response');
const { answerStudyQuestion } = require('../services/ai.service');
const questService = require('../utils/questService');

/**
 * POST /api/ai/chat
 * Body: { messages: [{ role: 'user'|'assistant', content: string }] }
 */
const postChat = async (req, res, next) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return sendError(res, 'AI assistant is not configured (set GEMINI_API_KEY)', 503);
    }

    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return sendError(res, 'messages array is required', 400);
    }

    // Extract the last message as the new question, everything before as history
    const lastMessage = messages[messages.length - 1]?.content || '';
    const history = messages.slice(0, -1);
    const reply = await answerStudyQuestion(history, lastMessage);

    // Fire quest completion check for AI sessions (aichat trigger)
    if (req.user.role === 'student') {
      const { query } = require('../db/neon');
      query('SELECT id FROM students WHERE user_id=$1', [req.user.id])
        .then(r => {
          if (r.rows.length) {
            questService.checkQuestCompletions(r.rows[0].id, 'aichat')
              .catch(e => console.error('[questService] aichat trigger error:', e.message));
          }
        })
        .catch(() => {});
    }

    return sendSuccess(res, { reply });
  } catch (err) {
    next(err);
  }
};

module.exports = { postChat };

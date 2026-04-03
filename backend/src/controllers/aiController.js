'use strict';

const { sendSuccess, sendError } = require('../utils/response');
const { chatStudentBuddy } = require('../utils/claudeApi');
const questService = require('../utils/questService');

/**
 * POST /api/ai/chat
 * Body: { messages: [{ role: 'user'|'assistant', content: string }] }
 */
const postChat = async (req, res, next) => {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return sendError(res, 'AI assistant is not configured (set ANTHROPIC_API_KEY)', 503);
    }

    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return sendError(res, 'messages array is required', 400);
    }

    const reply = await chatStudentBuddy(messages, {
      name: req.user.name,
      role: req.user.role,
    });

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

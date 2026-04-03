'use strict';

const { sendSuccess, sendError } = require('../utils/response');
const { chatStudentBuddy } = require('../utils/claudeApi');

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

    return sendSuccess(res, { reply });
  } catch (err) {
    next(err);
  }
};

module.exports = { postChat };

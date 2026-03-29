const express = require('express');
const router = express.Router();
const { protect, requireEmailVerified } = require('../middleware/auth');
const {
  getConversations, getOrCreateConversation,
  getMessages, sendMessage, reportMessage,
} = require('../controllers/messageController');

router.use(protect, requireEmailVerified);

router.get('/conversations', getConversations);
router.post('/conversations', getOrCreateConversation);
router.get('/conversations/:conversationId', getMessages);
router.post('/conversations/:conversationId', sendMessage);
router.post('/:messageId/report', reportMessage);

module.exports = router;

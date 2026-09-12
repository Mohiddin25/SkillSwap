const express = require('express');
const { body } = require('express-validator');
const { getConversations, getMessages, sendMessage, deleteConversation, deleteMessage } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');

const router = express.Router();

router.get('/conversations', protect, getConversations);
router.delete('/conversations/:id', protect, deleteConversation);
router.get('/conversations/:id/messages', protect, getMessages);
router.post(
  '/conversations/:id/messages',
  protect,
  [body('text').trim().notEmpty().withMessage('Message text is required')],
  validate,
  sendMessage
);
router.delete('/conversations/:id/messages/:messageId', protect, deleteMessage);

module.exports = router;


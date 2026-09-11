const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const { createNotification } = require('../services/notificationService');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * Get user conversations
 * GET /api/chat/conversations
 */
const getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({ participants: req.user._id })
      .sort({ updatedAt: -1 })
      .populate('participants', 'name email profileImage department year rating')
      .populate('lastMessage')
      .populate('swapRequest');

    return successResponse(res, 200, 'Conversations retrieved', conversations);
  } catch (error) {
    next(error);
  }
};

/**
 * Get messages in a conversation
 * GET /api/chat/conversations/:id/messages
 */
const getMessages = async (req, res, next) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      participants: req.user._id
    });

    if (!conversation) {
      return errorResponse(res, 404, 'Conversation not found or access denied');
    }

    const messages = await Message.find({ conversation: req.params.id })
      .sort({ createdAt: 1 })
      .populate('sender', 'name email profileImage');

    return successResponse(res, 200, 'Messages retrieved', messages);
  } catch (error) {
    next(error);
  }
};

/**
 * Send a message in a conversation
 * POST /api/chat/conversations/:id/messages
 */
const sendMessage = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return errorResponse(res, 400, 'Message text is required');
    }

    const conversation = await Conversation.findOne({
      _id: req.params.id,
      participants: req.user._id
    });

    if (!conversation) {
      return errorResponse(res, 404, 'Conversation not found or access denied');
    }

    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user._id,
      text: text.trim()
    });

    conversation.lastMessage = message._id;
    await conversation.save();

    // Notify recipient participant
    const recipientId = conversation.participants.find(
      (p) => p.toString() !== req.user._id.toString()
    );

    if (recipientId) {
      await createNotification({
        recipient: recipientId,
        type: 'new_message',
        title: `Message from ${req.user.name}`,
        message: text.length > 50 ? `${text.substring(0, 50)}...` : text,
        data: { conversationId: conversation._id, messageId: message._id }
      });
    }

    const populatedMessage = await Message.findById(message._id).populate('sender', 'name email profileImage');

    const io = req.app.get('io');
    if (io) {
      io.to(conversation._id.toString()).emit('message:receive', populatedMessage);
    }

    return successResponse(res, 201, 'Message sent successfully', populatedMessage);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getConversations,
  getMessages,
  sendMessage
};

const SwapRequest = require('../models/SwapRequest');
const User = require('../models/User');
const Conversation = require('../models/Conversation');
const Session = require('../models/Session');
const Skill = require('../models/Skill');
const { createNotification } = require('../services/notificationService');
const { calculateUserMatch } = require('../services/matchingService');
const Availability = require('../models/Availability');
const { successResponse, errorResponse } = require('../utils/apiResponse');


/**
 * Send a swap request
 * POST /api/requests
 */
const createRequest = async (req, res, next) => {
  try {
    const { receiverId, skillsOffered, skillsRequested, message, proposedTimeSlots } = req.body;

    if (receiverId === req.user._id.toString()) {
      return errorResponse(res, 400, 'You cannot send a swap request to yourself');
    }

    const receiver = await User.findById(receiverId);
    if (!receiver || !receiver.isActive) {
      return errorResponse(res, 404, 'Recipient user not found or inactive');
    }

    // Prevent duplicate active requests
    const activeRequest = await SwapRequest.findOne({
      sender: req.user._id,
      receiver: receiverId,
      status: { $in: ['pending', 'accepted'] }
    });

    if (activeRequest) {
      return errorResponse(res, 409, 'An active swap request already exists between you and this user');
    }

    // Calculate match score
    const senderUser = await User.findById(req.user._id).populate('skillsToTeach.skill').populate('skillsToLearn.skill');
    const receiverUser = await User.findById(receiverId).populate('skillsToTeach.skill').populate('skillsToLearn.skill');
    const senderAvail = await Availability.find({ userId: req.user._id });
    const receiverAvail = await Availability.find({ userId: receiverId });

    const matchCalculation = calculateUserMatch(senderUser, receiverUser, senderAvail, receiverAvail);

    const swapRequest = await SwapRequest.create({
      sender: req.user._id,
      receiver: receiverId,
      skillsOffered: skillsOffered || [],
      skillsRequested: skillsRequested || [],
      matchScore: matchCalculation.matchScore,
      message: message || '',
      proposedTimeSlots: proposedTimeSlots || matchCalculation.commonAvailability || []
    });

    // Notify receiver
    await createNotification({
      recipient: receiverId,
      type: 'swap_request',
      title: 'New Swap Request 🤝',
      message: `${req.user.name} sent you a skill swap request (${matchCalculation.matchScore}% match)!`,
      data: { swapRequestId: swapRequest._id }
    });

    const populatedRequest = await SwapRequest.findById(swapRequest._id)
      .populate('sender', 'name email department year campus profileImage rating')
      .populate('receiver', 'name email department year campus profileImage rating')
      .populate('skillsOffered')
      .populate('skillsRequested');

    const io = req.app.get('io');
    if (io) {
      io.to(`user:${receiverId}`).emit('request:created', populatedRequest);
    }

    return successResponse(res, 201, 'Swap request sent successfully', populatedRequest);
  } catch (error) {
    next(error);
  }
};

/**
 * Get sent swap requests
 * GET /api/requests/sent
 */
const getSentRequests = async (req, res, next) => {
  try {
    const requests = await SwapRequest.find({ sender: req.user._id })
      .sort({ createdAt: -1 })
      .populate('receiver', 'name email department year campus profileImage rating')
      .populate('skillsOffered')
      .populate('skillsRequested');

    return successResponse(res, 200, 'Sent requests retrieved', requests);
  } catch (error) {
    next(error);
  }
};

/**
 * Get received swap requests
 * GET /api/requests/received
 */
const getReceivedRequests = async (req, res, next) => {
  try {
    const requests = await SwapRequest.find({ receiver: req.user._id })
      .sort({ createdAt: -1 })
      .populate('sender', 'name email department year campus profileImage rating')
      .populate('skillsOffered')
      .populate('skillsRequested');

    return successResponse(res, 200, 'Received requests retrieved', requests);
  } catch (error) {
    next(error);
  }
};

/**
 * Get single request by ID
 * GET /api/requests/:id
 */
const getRequestById = async (req, res, next) => {
  try {
    const request = await SwapRequest.findById(req.params.id)
      .populate('sender', 'name email department year campus profileImage rating')
      .populate('receiver', 'name email department year campus profileImage rating')
      .populate('skillsOffered')
      .populate('skillsRequested');

    if (!request) {
      return errorResponse(res, 404, 'Swap request not found');
    }

    const isParticipant =
      request.sender._id.toString() === req.user._id.toString() ||
      request.receiver._id.toString() === req.user._id.toString();

    if (!isParticipant && req.user.role !== 'admin') {
      return errorResponse(res, 403, 'Unauthorized access to this request');
    }

    return successResponse(res, 200, 'Swap request retrieved', request);
  } catch (error) {
    next(error);
  }
};

/**
 * Accept a swap request
 * PATCH /api/requests/:id/accept
 */
const acceptRequest = async (req, res, next) => {
  try {
    const request = await SwapRequest.findById(req.params.id);
    if (!request) {
      return errorResponse(res, 404, 'Swap request not found');
    }

    if (request.receiver.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, 'Only the request recipient can accept this swap request');
    }

    if (request.status !== 'pending' && request.status !== 'accepted') {
      return errorResponse(res, 400, `Cannot accept request with status '${request.status}'`);
    }

    request.status = 'accepted';
    await request.save();

    // Idempotent Session Creation
    let session = await Session.findOne({ swapRequestId: request._id })
      .populate('teacher', 'name email department year campus profileImage')
      .populate('learner', 'name email department year campus profileImage')
      .populate('skill', 'name category');

    if (!session) {
      let skillId = request.skillsOffered?.[0] || request.skillsRequested?.[0];
      if (!skillId) {
        const fallbackSkill = await Skill.findOne({ isActive: true });
        if (fallbackSkill) skillId = fallbackSkill._id;
      }
      const tomorrow = new Date(Date.now() + 86400000);
      const tomorrowEnd = new Date(Date.now() + 86400000 + 3600000);

      const createdSession = await Session.create({
        swapRequestId: request._id,
        teacher: request.sender,
        learner: request.receiver,
        skill: skillId || '660000000000000000000001',
        scheduledStart: tomorrow,
        scheduledEnd: tomorrowEnd,
        location: 'Campus Main Library Commons / Online',
        status: 'scheduled'
      });

      session = await Session.findById(createdSession._id)
        .populate('teacher', 'name email department year campus profileImage rating')
        .populate('learner', 'name email department year campus profileImage rating')
        .populate('skill', 'name category');
    }


    // Create chat conversation between participants if doesn't exist
    let conversation = await Conversation.findOne({
      participants: { $all: [request.sender, request.receiver] }
    });

    if (!conversation) {
      await Conversation.create({
        participants: [request.sender, request.receiver],
        swapRequest: request._id
      });
    }

    // Send notification to sender
    await createNotification({
      recipient: request.sender,
      type: 'request_accepted',
      title: 'Swap Request Accepted! 🎉',
      message: `${req.user.name} accepted your skill swap request. You can now chat and schedule a session!`,
      data: { swapRequestId: request._id }
    });

    const populatedRequest = await SwapRequest.findById(request._id)
      .populate('sender', 'name email department year campus profileImage rating')
      .populate('receiver', 'name email department year campus profileImage rating')
      .populate('skillsOffered')
      .populate('skillsRequested');

    const io = req.app.get('io');
    if (io) {
      io.to(`user:${request.sender._id || request.sender}`).emit('request:accepted', {
        request: populatedRequest,
        session
      });
    }

    return successResponse(res, 200, 'Swap request accepted successfully', {
      request: populatedRequest,
      session
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reject a swap request
 * PATCH /api/requests/:id/reject
 */
const rejectRequest = async (req, res, next) => {
  try {
    const request = await SwapRequest.findById(req.params.id);
    if (!request) {
      return errorResponse(res, 404, 'Swap request not found');
    }

    if (request.receiver.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, 'Only the request recipient can reject this request');
    }

    if (request.status !== 'pending') {
      return errorResponse(res, 400, `Cannot reject request with status '${request.status}'`);
    }

    request.status = 'rejected';
    await request.save();

    await createNotification({
      recipient: request.sender,
      type: 'request_rejected',
      title: 'Swap Request Update',
      message: `${req.user.name} declined your skill swap request.`,
      data: { swapRequestId: request._id }
    });

    return successResponse(res, 200, 'Swap request rejected', request);
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel a swap request
 * PATCH /api/requests/:id/cancel
 */
const cancelRequest = async (req, res, next) => {
  try {
    const request = await SwapRequest.findById(req.params.id);
    if (!request) {
      return errorResponse(res, 404, 'Swap request not found');
    }

    if (request.sender.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, 'Only the request sender can cancel this request');
    }

    if (request.status === 'completed' || request.status === 'cancelled') {
      return errorResponse(res, 400, `Cannot cancel request in state '${request.status}'`);
    }

    request.status = 'cancelled';
    await request.save();

    return successResponse(res, 200, 'Swap request cancelled successfully', request);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRequest,
  getSentRequests,
  getReceivedRequests,
  getRequestById,
  acceptRequest,
  rejectRequest,
  cancelRequest
};

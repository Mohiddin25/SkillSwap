const Session = require('../models/Session');
const SwapRequest = require('../models/SwapRequest');
const User = require('../models/User');
const { awardSessionCredits } = require('../services/creditService');
const { evaluateUserBadgesAndLevel } = require('../services/badgeService');
const { createNotification } = require('../services/notificationService');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * Create a new learning session from an accepted request
 * POST /api/sessions
 */
const createSession = async (req, res, next) => {
  try {
    const { swapRequestId, teacherId, learnerId, skillId, scheduledStart, scheduledEnd, location, meetingLink, notes } = req.body;

    const swapRequest = await SwapRequest.findById(swapRequestId);
    if (!swapRequest) {
      return errorResponse(res, 404, 'Swap request not found');
    }

    if (swapRequest.status !== 'accepted') {
      return errorResponse(res, 400, 'Sessions can only be created for accepted swap requests');
    }

    const isParticipant =
      swapRequest.sender.toString() === req.user._id.toString() ||
      swapRequest.receiver.toString() === req.user._id.toString();

    if (!isParticipant) {
      return errorResponse(res, 403, 'You are not a participant in this swap request');
    }

    const start = new Date(scheduledStart);
    const end = new Date(scheduledEnd);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return errorResponse(res, 400, 'Invalid scheduledStart or scheduledEnd date format');
    }

    if (start >= end) {
      return errorResponse(res, 400, 'scheduledStart must be before scheduledEnd');
    }

    const session = await Session.create({
      swapRequestId,
      teacher: teacherId,
      learner: learnerId,
      skill: skillId,
      scheduledStart: start,
      scheduledEnd: end,
      location: location || 'Campus Library / Online',
      meetingLink: meetingLink || '',
      notes: notes || ''
    });

    const otherParticipantId = teacherId === req.user._id.toString() ? learnerId : teacherId;

    await createNotification({
      recipient: otherParticipantId,
      type: 'session_approaching',
      title: 'New Session Scheduled 📅',
      message: `A new skill session has been scheduled for ${start.toLocaleString()}.`,
      data: { sessionId: session._id }
    });

    const populated = await Session.findById(session._id)
      .populate('teacher', 'name email profileImage')
      .populate('learner', 'name email profileImage')
      .populate('skill', 'name category');

    return successResponse(res, 201, 'Session created successfully', populated);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all sessions for current user
 * GET /api/sessions/me
 */
const getMySessions = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = {
      $or: [{ teacher: req.user._id }, { learner: req.user._id }]
    };

    if (status) {
      query.status = status;
    }

    const sessions = await Session.find(query)
      .sort({ scheduledStart: -1 })
      .populate('teacher', 'name email profileImage rating')
      .populate('learner', 'name email profileImage rating')
      .populate('skill', 'name category');

    return successResponse(res, 200, 'User sessions retrieved', sessions);
  } catch (error) {
    next(error);
  }
};

/**
 * Get session by ID
 * GET /api/sessions/:id
 */
const getSessionById = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('teacher', 'name email profileImage rating')
      .populate('learner', 'name email profileImage rating')
      .populate('skill', 'name category');

    if (!session) {
      return errorResponse(res, 404, 'Session not found');
    }

    const isParticipant =
      session.teacher._id.toString() === req.user._id.toString() ||
      session.learner._id.toString() === req.user._id.toString();

    if (!isParticipant && req.user.role !== 'admin') {
      return errorResponse(res, 403, 'Unauthorized access to this session');
    }

    return successResponse(res, 200, 'Session retrieved', session);
  } catch (error) {
    next(error);
  }
};

/**
 * Complete a session
 * PATCH /api/sessions/:id/complete
 */
const completeSession = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return errorResponse(res, 404, 'Session not found');
    }

    const isParticipant =
      session.teacher.toString() === req.user._id.toString() ||
      session.learner.toString() === req.user._id.toString();

    if (!isParticipant && req.user.role !== 'admin') {
      return errorResponse(res, 403, 'Only session participants can complete a session');
    }

    if (session.status === 'completed') {
      return errorResponse(res, 400, 'Session is already marked as completed');
    }

    session.status = 'completed';
    await session.save();

    // Increment completed sessions counters
    await User.findByIdAndUpdate(session.teacher, {
      $inc: { sessionsCompleted: 1, teachingSessionsCompleted: 1 }
    });

    await User.findByIdAndUpdate(session.learner, {
      $inc: { sessionsCompleted: 1, learningSessionsCompleted: 1 }
    });

    // Award Skill Credits to Teacher
    const creditTransaction = await awardSessionCredits(session);

    // Evaluate badges for both participants
    await evaluateUserBadgesAndLevel(session.teacher);
    await evaluateUserBadgesAndLevel(session.learner);

    // Update SwapRequest status if applicable
    await SwapRequest.findByIdAndUpdate(session.swapRequestId, { status: 'completed' });

    return successResponse(res, 200, 'Session marked as completed successfully', {
      session,
      creditEarned: creditTransaction ? creditTransaction.amount : 0
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel a session
 * PATCH /api/sessions/:id/cancel
 */
const cancelSession = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return errorResponse(res, 404, 'Session not found');
    }

    const isParticipant =
      session.teacher.toString() === req.user._id.toString() ||
      session.learner.toString() === req.user._id.toString();

    if (!isParticipant && req.user.role !== 'admin') {
      return errorResponse(res, 403, 'Only session participants can cancel a session');
    }

    if (session.status === 'completed') {
      return errorResponse(res, 400, 'Cannot cancel a completed session');
    }

    session.status = 'cancelled';
    await session.save();

    return successResponse(res, 200, 'Session cancelled', session);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSession,
  getMySessions,
  getSessionById,
  completeSession,
  cancelSession
};

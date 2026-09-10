const Rating = require('../models/Rating');
const Session = require('../models/Session');
const { updateUserReputation } = require('../services/reputationService');
const { evaluateUserBadgesAndLevel } = require('../services/badgeService');
const { createNotification } = require('../services/notificationService');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * Submit a rating for a completed session
 * POST /api/ratings
 */
const createRating = async (req, res, next) => {
  try {
    const { sessionId, score, feedback, communication, teachingQuality, punctuality } = req.body;

    const session = await Session.findById(sessionId);
    if (!session) {
      return errorResponse(res, 404, 'Session not found');
    }

    if (session.status !== 'completed') {
      return errorResponse(res, 400, 'Ratings can only be submitted for completed sessions');
    }

    const raterId = req.user._id.toString();
    const teacherId = session.teacher.toString();
    const learnerId = session.learner.toString();

    if (raterId !== teacherId && raterId !== learnerId) {
      return errorResponse(res, 403, 'You were not a participant in this session');
    }

    const rateeId = raterId === teacherId ? learnerId : teacherId;

    // Check duplicate rating
    const existingRating = await Rating.findOne({ session: sessionId, rater: raterId });
    if (existingRating) {
      return errorResponse(res, 409, 'You have already rated this session');
    }

    const rating = await Rating.create({
      session: sessionId,
      rater: raterId,
      ratee: rateeId,
      score,
      feedback: feedback || '',
      communication: communication || 5,
      teachingQuality: teachingQuality || 5,
      punctuality: punctuality || 5
    });

    // Update reputation score and avg rating
    const updatedUser = await updateUserReputation(rateeId);
    await evaluateUserBadgesAndLevel(rateeId);

    // Notify ratee
    await createNotification({
      recipient: rateeId,
      type: 'rating_received',
      title: 'New Session Review ⭐',
      message: `${req.user.name} rated your session ${score}/5 stars!`,
      data: { ratingId: rating._id, score }
    });

    return successResponse(res, 201, 'Rating submitted successfully', {
      rating,
      newAverageRating: updatedUser ? updatedUser.rating : score
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get ratings received by a user
 * GET /api/users/:id/ratings
 */
const getUserRatings = async (req, res, next) => {
  try {
    const ratings = await Rating.find({ ratee: req.params.id })
      .sort({ createdAt: -1 })
      .populate('rater', 'name email profileImage')
      .populate('session');

    return successResponse(res, 200, 'User ratings retrieved', ratings);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRating,
  getUserRatings
};

const User = require('../models/User');
const SwapRequest = require('../models/SwapRequest');
const Session = require('../models/Session');
const Notification = require('../models/Notification');
const Skill = require('../models/Skill');
const { findMatchesForUser } = require('../services/matchingService');
const { sanitizeUser } = require('../utils/helpers');
const { successResponse } = require('../utils/apiResponse');

/**
 * Aggregated Dashboard summary for authenticated student
 * GET /api/dashboard
 */
const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId)
      .populate('skillsToTeach.skill')
      .populate('skillsToLearn.skill')
      .populate('badges');

    // Fetch new matches count
    const matchesResult = await findMatchesForUser(userId, { limit: 5 });

    // Fetch upcoming sessions
    const upcomingSessions = await Session.find({
      $or: [{ teacher: userId }, { learner: userId }],
      status: 'scheduled',
      scheduledStart: { $gte: new Date() }
    })
      .sort({ scheduledStart: 1 })
      .limit(5)
      .populate('teacher', 'name email profileImage')
      .populate('learner', 'name email profileImage')
      .populate('skill', 'name category');

    // Fetch pending requests
    const pendingRequests = await SwapRequest.find({
      receiver: userId,
      status: 'pending'
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('sender', 'name email department year rating profileImage')
      .populate('skillsOffered')
      .populate('skillsRequested');

    // Fetch recent notifications
    const recentNotifications = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .limit(5);

    // Fetch top 3 trending skills
    const skills = await Skill.find({ isActive: true }).limit(5);

    return successResponse(res, 200, 'Dashboard data retrieved successfully', {
      user: sanitizeUser(user),
      newMatchesCount: matchesResult.totalMatches,
      topMatches: matchesResult.matches,
      skillCredits: user.skillCredits,
      contributorLevel: user.contributorLevel,
      rating: user.rating,
      totalRatings: user.totalRatings,
      reputationScore: user.reputationScore,
      sessionsCompleted: user.sessionsCompleted,
      pendingRequestsCount: pendingRequests.length,
      pendingRequests,
      upcomingSessions,
      recentNotifications,
      earnedBadges: user.badges || [],
      trendingSkills: skills.map((s) => ({ id: s._id, name: s.name, category: s.category }))
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard
};

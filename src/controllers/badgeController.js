const Badge = require('../models/Badge');
const User = require('../models/User');
const { ensureDefaultBadgesExist } = require('../services/badgeService');
const { successResponse } = require('../utils/apiResponse');

/**
 * Get all available system badges
 * GET /api/badges
 */
const getAllBadges = async (req, res, next) => {
  try {
    await ensureDefaultBadgesExist();
    const badges = await Badge.find({});
    return successResponse(res, 200, 'Badges retrieved', badges);
  } catch (error) {
    next(error);
  }
};

/**
 * Get authenticated user's earned badges
 * GET /api/users/me/badges
 */
const getMyBadges = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('badges');
    return successResponse(res, 200, 'User badges retrieved', {
      contributorLevel: user.contributorLevel,
      badges: user.badges || []
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllBadges,
  getMyBadges
};

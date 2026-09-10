const { findMatchesForUser } = require('../services/matchingService');
const { successResponse } = require('../utils/apiResponse');

/**
 * Get ranked compatible matches for authenticated student
 * GET /api/matches
 */
const getMatches = async (req, res, next) => {
  try {
    const {
      minScore,
      skill,
      department,
      year,
      skillLevel,
      campus,
      availabilityDay,
      page,
      limit
    } = req.query;

    const result = await findMatchesForUser(req.user._id, {
      minScore: minScore ? parseInt(minScore, 10) : 0,
      skill,
      department,
      year,
      skillLevel,
      campus,
      availabilityDay,
      page,
      limit
    });

    return successResponse(res, 200, 'Matches calculated and retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMatches
};

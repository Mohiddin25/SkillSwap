const Report = require('../models/Report');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * File a report against a user
 * POST /api/reports
 */
const createReport = async (req, res, next) => {
  try {
    const { reportedUserId, reason, details } = req.body;

    if (reportedUserId === req.user._id.toString()) {
      return errorResponse(res, 400, 'You cannot report yourself');
    }

    const reportedUser = await User.findById(reportedUserId);
    if (!reportedUser) {
      return errorResponse(res, 404, 'Reported user not found');
    }

    const report = await Report.create({
      reporter: req.user._id,
      reportedUser: reportedUserId,
      reason,
      details: details || ''
    });

    return successResponse(res, 201, 'Report submitted successfully and pending admin review', report);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReport
};

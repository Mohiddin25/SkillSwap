const User = require('../models/User');
const Report = require('../models/Report');
const Skill = require('../models/Skill');
const { sanitizeUser } = require('../utils/helpers');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * Get list of users (Admin only)
 * GET /api/admin/users
 */
const getUsers = async (req, res, next) => {
  try {
    const { search, role, isActive, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    return successResponse(res, 200, 'Admin users list retrieved', {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      users: users.map(sanitizeUser)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get reports (Admin only)
 * GET /api/admin/reports
 */
const getReports = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) query.status = status;

    const reports = await Report.find(query)
      .sort({ createdAt: -1 })
      .populate('reporter', 'name email department')
      .populate('reportedUser', 'name email department isActive');

    return successResponse(res, 200, 'Admin reports list retrieved', reports);
  } catch (error) {
    next(error);
  }
};

/**
 * Update report status (Admin only)
 * PATCH /api/admin/reports/:id
 */
const updateReport = async (req, res, next) => {
  try {
    const { status, adminNotes } = req.body;
    const report = await Report.findById(req.params.id);
    if (!report) {
      return errorResponse(res, 404, 'Report not found');
    }

    if (status) report.status = status;
    if (adminNotes !== undefined) report.adminNotes = adminNotes;

    await report.save();
    return successResponse(res, 200, 'Report updated successfully', report);
  } catch (error) {
    next(error);
  }
};

/**
 * Suspend/Unsuspend user (Admin only)
 * PATCH /api/admin/users/:id/suspend
 */
const suspendUser = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    user.isActive = isActive !== undefined ? isActive : !user.isActive;
    await user.save();

    return successResponse(
      res,
      200,
      `User ${user.isActive ? 'activated' : 'suspended'} successfully`,
      sanitizeUser(user)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Verify user account (Admin only)
 * PATCH /api/admin/users/:id/verify
 */
const verifyUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    user.isVerified = true;
    await user.save();

    return successResponse(res, 200, 'User verified successfully', sanitizeUser(user));
  } catch (error) {
    next(error);
  }
};

/**
 * Verify specific teaching skill of a user (Admin only)
 * PATCH /api/admin/users/:userId/skills/:skillId/verify
 */
const verifySkill = async (req, res, next) => {
  try {
    const { userId, skillId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    const teachSkill = user.skillsToTeach.find(
      (item) => item.skill.toString() === skillId || item._id.toString() === skillId
    );

    if (!teachSkill) {
      return errorResponse(res, 404, 'Teach skill entry not found on user profile');
    }

    teachSkill.isVerified = true;
    await user.save();

    return successResponse(res, 200, 'User skill verified successfully', sanitizeUser(user));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getReports,
  updateReport,
  suspendUser,
  verifyUser,
  verifySkill
};

const User = require('../models/User');
const Skill = require('../models/Skill');
const { normalizeSkillName } = require('../utils/skillNormalizer');
const { sanitizeUser } = require('../utils/helpers');
const { successResponse } = require('../utils/apiResponse');

/**
 * Global search for students and skills
 * GET /api/search
 */
const globalSearch = async (req, res, next) => {
  try {
    const { q, department, campus, page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;

    let userQuery = { isActive: true };
    if (department) userQuery.department = department;
    if (campus) userQuery.campus = campus;

    if (q) {
      const normalizedQ = normalizeSkillName(q).toLowerCase();
      // Find matching skills first
      const matchingSkills = await Skill.find({
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { normalizedName: { $regex: normalizedQ, $options: 'i' } }
        ]
      }).select('_id');

      const skillIds = matchingSkills.map((s) => s._id);

      userQuery.$or = [
        { name: { $regex: q, $options: 'i' } },
        { department: { $regex: q, $options: 'i' } },
        { campus: { $regex: q, $options: 'i' } },
        { 'skillsToTeach.skill': { $in: skillIds } },
        { 'skillsToLearn.skill': { $in: skillIds } }
      ];
    }

    const total = await User.countDocuments(userQuery);
    const users = await User.find(userQuery)
      .populate('skillsToTeach.skill')
      .populate('skillsToLearn.skill')
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    return successResponse(res, 200, 'Search results retrieved', {
      query: q || '',
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      results: users.map(sanitizeUser)
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  globalSearch
};

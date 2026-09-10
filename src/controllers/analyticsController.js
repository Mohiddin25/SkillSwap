const Skill = require('../models/Skill');
const User = require('../models/User');
const { successResponse } = require('../utils/apiResponse');

/**
 * Get campus trending skills analytics
 * GET /api/analytics/trending-skills
 */
const getTrendingSkills = async (req, res, next) => {
  try {
    const skills = await Skill.find({ isActive: true });
    const users = await User.find({ isActive: true }).select('skillsToTeach skillsToLearn');

    const learnerCountMap = new Map();
    const teacherCountMap = new Map();

    users.forEach((u) => {
      (u.skillsToLearn || []).forEach((item) => {
        const sId = item.skill.toString();
        learnerCountMap.set(sId, (learnerCountMap.get(sId) || 0) + 1);
      });

      (u.skillsToTeach || []).forEach((item) => {
        const sId = item.skill.toString();
        teacherCountMap.set(sId, (teacherCountMap.get(sId) || 0) + 1);
      });
    });

    const analytics = skills.map((skill) => {
      const sId = skill._id.toString();
      const learners = learnerCountMap.get(sId) || 0;
      const teachers = teacherCountMap.get(sId) || 0;
      const unmetDemand = Math.max(0, learners - teachers);

      // Demand score formula: (learners * 2) + unmetDemand
      const demandScore = learners * 2 + unmetDemand;

      return {
        skillId: skill._id,
        skill: skill.name,
        category: skill.category,
        learners,
        teachers,
        unmetDemand,
        demandScore
      };
    });

    // Sort by demand score descending
    analytics.sort((a, b) => b.demandScore - a.demandScore);

    return successResponse(res, 200, 'Trending skills analytics retrieved', analytics);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTrendingSkills
};

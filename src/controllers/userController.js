const User = require('../models/User');
const Skill = require('../models/Skill');
const { normalizeSkillName } = require('../utils/skillNormalizer');
const { sanitizeUser } = require('../utils/helpers');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { evaluateUserBadgesAndLevel } = require('../services/badgeService');

/**
 * Get current user profile
 * GET /api/users/me
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('skillsToTeach.skill')
      .populate('skillsToLearn.skill')
      .populate('badges');

    return successResponse(res, 200, 'Profile retrieved', sanitizeUser(user));
  } catch (error) {
    next(error);
  }
};

/**
 * Update current user profile
 * PUT /api/users/me
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, department, year, campus, bio, profileImage } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    if (name) user.name = name;
    if (department) user.department = department;
    if (year) user.year = year;
    if (campus) user.campus = campus;
    if (bio !== undefined) user.bio = bio;
    if (profileImage !== undefined) user.profileImage = profileImage;

    await user.save();
    const updatedUser = await User.findById(user._id)
      .populate('skillsToTeach.skill')
      .populate('skillsToLearn.skill')
      .populate('badges');

    return successResponse(res, 200, 'Profile updated successfully', sanitizeUser(updatedUser));
  } catch (error) {
    next(error);
  }
};

/**
 * Get user profile by ID
 * GET /api/users/:id
 */
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('skillsToTeach.skill')
      .populate('skillsToLearn.skill')
      .populate('badges');

    if (!user || !user.isActive) {
      return errorResponse(res, 404, 'User not found');
    }

    return successResponse(res, 200, 'User profile retrieved', sanitizeUser(user));
  } catch (error) {
    next(error);
  }
};

/**
 * Add a skill to Teach
 * POST /api/users/me/skills/teach
 */
const addTeachSkill = async (req, res, next) => {
  try {
    const { skillId, skillName, skillLevel, experience, description } = req.body;

    let targetSkill;
    if (skillId) {
      targetSkill = await Skill.findById(skillId);
    } else if (skillName) {
      const normalized = normalizeSkillName(skillName);
      targetSkill = await Skill.findOne({ normalizedName: normalized.toLowerCase() });
      if (!targetSkill) {
        targetSkill = await Skill.create({
          name: normalized,
          normalizedName: normalized.toLowerCase(),
          category: 'Other'
        });
      }
    }

    if (!targetSkill) {
      return errorResponse(res, 400, 'Valid skillId or skillName is required');
    }

    const user = await User.findById(req.user._id);
    const existingIndex = user.skillsToTeach.findIndex(
      (item) => item.skill.toString() === targetSkill._id.toString()
    );

    if (existingIndex !== -1) {
      user.skillsToTeach[existingIndex].skillLevel = skillLevel || user.skillsToTeach[existingIndex].skillLevel;
      user.skillsToTeach[existingIndex].experience = experience || user.skillsToTeach[existingIndex].experience;
      user.skillsToTeach[existingIndex].description = description || user.skillsToTeach[existingIndex].description;
    } else {
      user.skillsToTeach.push({
        skill: targetSkill._id,
        skillLevel: skillLevel || 'Intermediate',
        experience: experience || '',
        description: description || ''
      });
    }

    await user.save();
    await evaluateUserBadgesAndLevel(user._id);

    const updatedUser = await User.findById(user._id)
      .populate('skillsToTeach.skill')
      .populate('skillsToLearn.skill');

    return successResponse(res, 200, 'Teach skill updated', sanitizeUser(updatedUser));
  } catch (error) {
    next(error);
  }
};

/**
 * Remove a skill from Teach
 * DELETE /api/users/me/skills/teach/:skillId
 */
const removeTeachSkill = async (req, res, next) => {
  try {
    const { skillId } = req.params;
    const user = await User.findById(req.user._id);

    user.skillsToTeach = user.skillsToTeach.filter(
      (item) => item.skill.toString() !== skillId && item._id.toString() !== skillId
    );

    await user.save();
    const updatedUser = await User.findById(user._id)
      .populate('skillsToTeach.skill')
      .populate('skillsToLearn.skill');

    return successResponse(res, 200, 'Teach skill removed', sanitizeUser(updatedUser));
  } catch (error) {
    next(error);
  }
};

/**
 * Add a skill to Learn
 * POST /api/users/me/skills/learn
 */
const addLearnSkill = async (req, res, next) => {
  try {
    const { skillId, skillName, desiredLevel, priority } = req.body;

    let targetSkill;
    if (skillId) {
      targetSkill = await Skill.findById(skillId);
    } else if (skillName) {
      const normalized = normalizeSkillName(skillName);
      targetSkill = await Skill.findOne({ normalizedName: normalized.toLowerCase() });
      if (!targetSkill) {
        targetSkill = await Skill.create({
          name: normalized,
          normalizedName: normalized.toLowerCase(),
          category: 'Other'
        });
      }
    }

    if (!targetSkill) {
      return errorResponse(res, 400, 'Valid skillId or skillName is required');
    }

    const user = await User.findById(req.user._id);
    const existingIndex = user.skillsToLearn.findIndex(
      (item) => item.skill.toString() === targetSkill._id.toString()
    );

    if (existingIndex !== -1) {
      user.skillsToLearn[existingIndex].desiredLevel = desiredLevel || user.skillsToLearn[existingIndex].desiredLevel;
      user.skillsToLearn[existingIndex].priority = priority || user.skillsToLearn[existingIndex].priority;
    } else {
      user.skillsToLearn.push({
        skill: targetSkill._id,
        desiredLevel: desiredLevel || 'Beginner',
        priority: priority || 'Medium'
      });
    }

    await user.save();
    await evaluateUserBadgesAndLevel(user._id);

    const updatedUser = await User.findById(user._id)
      .populate('skillsToTeach.skill')
      .populate('skillsToLearn.skill');

    return successResponse(res, 200, 'Learn skill updated', sanitizeUser(updatedUser));
  } catch (error) {
    next(error);
  }
};

/**
 * Remove a skill from Learn
 * DELETE /api/users/me/skills/learn/:skillId
 */
const removeLearnSkill = async (req, res, next) => {
  try {
    const { skillId } = req.params;
    const user = await User.findById(req.user._id);

    user.skillsToLearn = user.skillsToLearn.filter(
      (item) => item.skill.toString() !== skillId && item._id.toString() !== skillId
    );

    await user.save();
    const updatedUser = await User.findById(user._id)
      .populate('skillsToTeach.skill')
      .populate('skillsToLearn.skill');

    return successResponse(res, 200, 'Learn skill removed', sanitizeUser(updatedUser));
  } catch (error) {
    next(error);
  }
};

/**
 * Block a user
 * POST /api/users/:id/block
 */
const blockUser = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;
    if (targetUserId === req.user._id.toString()) {
      return errorResponse(res, 400, 'You cannot block yourself');
    }

    const user = await User.findById(req.user._id);
    if (!user.blockedUsers.includes(targetUserId)) {
      user.blockedUsers.push(targetUserId);
      await user.save();
    }

    return successResponse(res, 200, 'User blocked successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Unblock a user
 * DELETE /api/users/:id/block
 */
const unblockUser = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;
    const user = await User.findById(req.user._id);

    user.blockedUsers = user.blockedUsers.filter(
      (id) => id.toString() !== targetUserId
    );

    await user.save();
    return successResponse(res, 200, 'User unblocked successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getUserById,
  addTeachSkill,
  removeTeachSkill,
  addLearnSkill,
  removeLearnSkill,
  blockUser,
  unblockUser
};

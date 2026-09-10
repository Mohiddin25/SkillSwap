const Skill = require('../models/Skill');
const { normalizeSkillName } = require('../utils/skillNormalizer');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * Get all skills
 * GET /api/skills
 */
const getAllSkills = async (req, res, next) => {
  try {
    const { category, search, page = 1, limit = 50 } = req.query;
    const query = { isActive: true };

    if (category) {
      query.category = category;
    }

    if (search) {
      const normalizedSearch = normalizeSkillName(search).toLowerCase();
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { normalizedName: { $regex: normalizedSearch, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;

    const total = await Skill.countDocuments(query);
    const skills = await Skill.find(query)
      .sort({ popularity: -1, name: 1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    return successResponse(res, 200, 'Skills retrieved successfully', {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      skills
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get skill by ID
 * GET /api/skills/:id
 */
const getSkillById = async (req, res, next) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill || !skill.isActive) {
      return errorResponse(res, 404, 'Skill not found');
    }
    return successResponse(res, 200, 'Skill retrieved successfully', skill);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new skill
 * POST /api/skills
 */
const createSkill = async (req, res, next) => {
  try {
    const { name, category, description } = req.body;
    if (!name) {
      return errorResponse(res, 400, 'Skill name is required');
    }

    const normalized = normalizeSkillName(name);
    const existing = await Skill.findOne({ normalizedName: normalized.toLowerCase() });
    if (existing) {
      return errorResponse(res, 409, `Skill '${existing.name}' already exists`, existing);
    }

    const skill = await Skill.create({
      name: normalized,
      normalizedName: normalized.toLowerCase(),
      category: category || 'Other',
      description: description || ''
    });

    return successResponse(res, 201, 'Skill created successfully', skill);
  } catch (error) {
    next(error);
  }
};

/**
 * Update skill
 * PUT /api/skills/:id
 */
const updateSkill = async (req, res, next) => {
  try {
    const { name, category, description, popularity, isActive } = req.body;
    const skill = await Skill.findById(req.params.id);
    if (!skill) {
      return errorResponse(res, 404, 'Skill not found');
    }

    if (name) {
      skill.name = normalizeSkillName(name);
      skill.normalizedName = skill.name.toLowerCase();
    }
    if (category) skill.category = category;
    if (description !== undefined) skill.description = description;
    if (popularity !== undefined) skill.popularity = popularity;
    if (isActive !== undefined) skill.isActive = isActive;

    await skill.save();
    return successResponse(res, 200, 'Skill updated successfully', skill);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete skill
 * DELETE /api/skills/:id
 */
const deleteSkill = async (req, res, next) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) {
      return errorResponse(res, 404, 'Skill not found');
    }
    skill.isActive = false;
    await skill.save();
    return successResponse(res, 200, 'Skill deleted (deactivated) successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllSkills,
  getSkillById,
  createSkill,
  updateSkill,
  deleteSkill
};

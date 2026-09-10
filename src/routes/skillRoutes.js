const express = require('express');
const { body } = require('express-validator');
const {
  getAllSkills,
  getSkillById,
  createSkill,
  updateSkill,
  deleteSkill
} = require('../controllers/skillController');
const { protect } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/adminMiddleware');
const { validate } = require('../middleware/validationMiddleware');

const router = express.Router();

router.get('/', getAllSkills);
router.get('/:id', getSkillById);

router.post(
  '/',
  protect,
  [body('name').trim().notEmpty().withMessage('Skill name is required')],
  validate,
  createSkill
);

router.put('/:id', protect, requireAdmin, updateSkill);
router.delete('/:id', protect, requireAdmin, deleteSkill);

module.exports = router;

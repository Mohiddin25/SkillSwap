const express = require('express');
const { body } = require('express-validator');
const {
  getProfile,
  updateProfile,
  getUserById,
  addTeachSkill,
  removeTeachSkill,
  addLearnSkill,
  removeLearnSkill,
  blockUser,
  unblockUser
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');

const router = express.Router();

router.get('/me', protect, getProfile);
router.put('/me', protect, updateProfile);

router.post(
  '/me/skills/teach',
  protect,
  [
    body('skillLevel')
      .optional()
      .isIn(['Beginner', 'Intermediate', 'Advanced', 'Expert'])
      .withMessage('Invalid skill level')
  ],
  validate,
  addTeachSkill
);

router.delete('/me/skills/teach/:skillId', protect, removeTeachSkill);

router.post(
  '/me/skills/learn',
  protect,
  [
    body('desiredLevel')
      .optional()
      .isIn(['Beginner', 'Intermediate', 'Advanced', 'Expert'])
      .withMessage('Invalid desired level'),
    body('priority')
      .optional()
      .isIn(['Low', 'Medium', 'High'])
      .withMessage('Invalid priority level')
  ],
  validate,
  addLearnSkill
);

router.delete('/me/skills/learn/:skillId', protect, removeLearnSkill);

router.post('/:id/block', protect, blockUser);
router.delete('/:id/block', protect, unblockUser);

router.get('/:id', protect, getUserById);

module.exports = router;

const express = require('express');
const { body } = require('express-validator');
const {
  createSession,
  getMySessions,
  getSessionById,
  completeSession,
  cancelSession
} = require('../controllers/sessionController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');

const router = express.Router();

const createSessionValidation = [
  body('swapRequestId').notEmpty().withMessage('Swap Request ID is required'),
  body('teacherId').notEmpty().withMessage('Teacher ID is required'),
  body('learnerId').notEmpty().withMessage('Learner ID is required'),
  body('skillId').notEmpty().withMessage('Skill ID is required'),
  body('scheduledStart').notEmpty().withMessage('Scheduled start time is required'),
  body('scheduledEnd').notEmpty().withMessage('Scheduled end time is required')
];

router.post('/', protect, createSessionValidation, validate, createSession);
router.get('/me', protect, getMySessions);
router.get('/:id', protect, getSessionById);

router.patch('/:id/complete', protect, completeSession);
router.patch('/:id/cancel', protect, cancelSession);

module.exports = router;

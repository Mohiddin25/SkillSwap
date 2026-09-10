const express = require('express');
const { body } = require('express-validator');
const {
  getMyAvailability,
  createSlot,
  updateSlot,
  deleteSlot
} = require('../controllers/availabilityController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');

const router = express.Router();

const slotValidation = [
  body('dayOfWeek').notEmpty().withMessage('Day of week is required'),
  body('startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('startTime must be in HH:MM format (e.g. 17:00)'),
  body('endTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('endTime must be in HH:MM format (e.g. 19:00)')
];

router.get('/me', protect, getMyAvailability);
router.post('/', protect, slotValidation, validate, createSlot);
router.put('/:id', protect, updateSlot);
router.delete('/:id', protect, deleteSlot);

module.exports = router;

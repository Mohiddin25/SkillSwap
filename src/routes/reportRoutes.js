const express = require('express');
const { body } = require('express-validator');
const { createReport } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');

const router = express.Router();

router.post(
  '/',
  protect,
  [
    body('reportedUserId').notEmpty().withMessage('Reported User ID is required'),
    body('reason')
      .isIn(['inappropriate_behavior', 'fake_skill', 'harassment', 'spam', 'other'])
      .withMessage('Valid reason is required')
  ],
  validate,
  createReport
);

module.exports = router;

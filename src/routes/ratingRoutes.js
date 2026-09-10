const express = require('express');
const { body } = require('express-validator');
const { createRating, getUserRatings } = require('../controllers/ratingController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');

const router = express.Router();

router.post(
  '/',
  protect,
  [
    body('sessionId').notEmpty().withMessage('Session ID is required'),
    body('score').isInt({ min: 1, max: 5 }).withMessage('Score must be an integer between 1 and 5')
  ],
  validate,
  createRating
);

router.get('/users/:id', getUserRatings);

module.exports = router;

const express = require('express');
const { body } = require('express-validator');
const {
  createRequest,
  getSentRequests,
  getReceivedRequests,
  getRequestById,
  acceptRequest,
  rejectRequest,
  cancelRequest
} = require('../controllers/requestController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');

const router = express.Router();

router.post(
  '/',
  protect,
  [body('receiverId').notEmpty().withMessage('Receiver ID is required')],
  validate,
  createRequest
);

router.get('/sent', protect, getSentRequests);
router.get('/received', protect, getReceivedRequests);
router.get('/:id', protect, getRequestById);

router.patch('/:id/accept', protect, acceptRequest);
router.patch('/:id/reject', protect, rejectRequest);
router.patch('/:id/cancel', protect, cancelRequest);

module.exports = router;

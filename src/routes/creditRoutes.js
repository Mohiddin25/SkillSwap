const express = require('express');
const { getBalance, getHistory } = require('../controllers/creditController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/balance', protect, getBalance);
router.get('/history', protect, getHistory);

module.exports = router;

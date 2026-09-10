const express = require('express');
const { getAllBadges, getMyBadges } = require('../controllers/badgeController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getAllBadges);
router.get('/me', protect, getMyBadges);

module.exports = router;

const express = require('express');
const { getMatches } = require('../controllers/matchingController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getMatches);

module.exports = router;

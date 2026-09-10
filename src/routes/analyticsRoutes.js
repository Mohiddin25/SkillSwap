const express = require('express');
const { getTrendingSkills } = require('../controllers/analyticsController');

const router = express.Router();

router.get('/trending-skills', getTrendingSkills);

module.exports = router;

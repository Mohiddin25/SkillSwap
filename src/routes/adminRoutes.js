const express = require('express');
const {
  getUsers,
  getReports,
  updateReport,
  suspendUser,
  verifyUser,
  verifySkill
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/adminMiddleware');

const router = express.Router();

router.use(protect, requireAdmin);

router.get('/users', getUsers);
router.patch('/users/:id/suspend', suspendUser);
router.patch('/users/:id/verify', verifyUser);
router.patch('/users/:userId/skills/:skillId/verify', verifySkill);

router.get('/reports', getReports);
router.patch('/reports/:id', updateReport);

module.exports = router;

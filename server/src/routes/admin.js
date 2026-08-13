const express = require('express');
const router = express.Router();
const { getStats, getUsers, toggleUserStatus, getDashboardData } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect);
router.get('/dashboard', getDashboardData);
router.get('/stats', adminOnly, getStats);
router.get('/users', adminOnly, getUsers);
router.patch('/users/:id/toggle', adminOnly, toggleUserStatus);

module.exports = router;

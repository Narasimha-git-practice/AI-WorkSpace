const express = require('express');
const router = express.Router();
const {
  register, login, getMe, updateProfile, uploadAvatar, changePassword, forgotPassword, resetPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const upload = require('../config/multer');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/avatar', protect, (req, res, next) => {
  req.uploadType = 'avatars';
  next();
}, upload.single('avatar'), uploadAvatar);

module.exports = router;

const crypto = require('crypto');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/response');
const nodemailer = require('nodemailer');

const sendToken = (res, user, statusCode, message) => {
  const token = user.getSignedJwt();
  sendSuccess(res, statusCode, message, {
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      theme: user.theme,
      language: user.language,
    },
  });
};

// @desc Register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return sendError(res, 400, 'Email already registered');

    const user = await User.create({ name, email, password });
    user.lastLogin = new Date();
    await user.save();
    sendToken(res, user, 201, 'Account created successfully');
  } catch (error) {
    next(error);
  }
};

// @desc Login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return sendError(res, 400, 'Please provide email and password');

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return sendError(res, 401, 'Invalid email or password');
    }
    if (!user.isActive) return sendError(res, 403, 'Account is deactivated. Contact support.');

    user.lastLogin = new Date();
    await user.save();
    sendToken(res, user, 200, 'Login successful');
  } catch (error) {
    next(error);
  }
};

// @desc Get current user
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    sendSuccess(res, 200, 'User fetched', user);
  } catch (error) {
    next(error);
  }
};

// @desc Update profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, bio, website, company, theme, language } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, bio, website, company, theme, language },
      { new: true, runValidators: true }
    );
    sendSuccess(res, 200, 'Profile updated', user);
  } catch (error) {
    next(error);
  }
};

// @desc Upload avatar
exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) return sendError(res, 400, 'Please upload an image');
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(req.user._id, { avatar: avatarUrl }, { new: true });
    sendSuccess(res, 200, 'Avatar updated', { avatar: user.avatar });
  } catch (error) {
    next(error);
  }
};

// @desc Change password
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.matchPassword(currentPassword))) {
      return sendError(res, 400, 'Current password is incorrect');
    }
    user.password = newPassword;
    await user.save();
    sendToken(res, user, 200, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
};

// @desc Forgot password
exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return sendError(res, 404, 'No account found with that email');

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    try {
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      });
      await transporter.sendMail({
        from: `WorkSpace <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'Reset Your Password - WorkSpace',
        html: `<h2>Password Reset</h2><p>Click the link below to reset your password. This link expires in 30 minutes.</p><a href="${resetUrl}" style="background:#6366f1;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block">Reset Password</a><p>If you did not request this, please ignore this email.</p>`,
      });
      sendSuccess(res, 200, 'Password reset email sent');
    } catch {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return sendError(res, 500, 'Email could not be sent. Please try again.');
    }
  } catch (error) {
    next(error);
  }
};

// @desc Reset password
exports.resetPassword = async (req, res, next) => {
  try {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });
    if (!user) return sendError(res, 400, 'Invalid or expired reset token');

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    sendToken(res, user, 200, 'Password reset successful');
  } catch (error) {
    next(error);
  }
};

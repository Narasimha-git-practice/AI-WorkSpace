const User = require('../models/User');
const Note = require('../models/Note');
const Task = require('../models/Task');
const Document = require('../models/Document');
const File = require('../models/File');
const { sendSuccess } = require('../utils/response');

// @desc  Get platform-wide admin stats (admin only)
// @route GET /api/admin/stats
exports.getStats = async (req, res, next) => {
  try {
    const [totalUsers, totalNotes, totalTasks, totalDocs, totalFiles, recentUsers] =
      await Promise.all([
        User.countDocuments(),
        Note.countDocuments(),
        Task.countDocuments(),
        Document.countDocuments(),
        File.countDocuments(),
        User.find().sort({ createdAt: -1 }).limit(10).select('name email avatar role createdAt lastLogin'),
      ]);

    sendSuccess(res, 200, 'Admin stats fetched', {
      totalUsers,
      totalNotes,
      totalTasks,
      totalDocs,
      totalFiles,
      recentUsers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Get all users with pagination (admin only)
// @route GET /api/admin/users
exports.getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find().sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).select('-password'),
      User.countDocuments(),
    ]);
    sendSuccess(res, 200, 'Users fetched', users, { total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

// @desc  Activate / deactivate a user account
// @route PATCH /api/admin/users/:id/toggle
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return sendSuccess(res, 404, 'User not found');
    user.isActive = !user.isActive;
    await user.save();
    sendSuccess(res, 200, `User ${user.isActive ? 'activated' : 'deactivated'}`, user);
  } catch (error) {
    next(error);
  }
};

// @desc  Get dashboard summary data for the logged-in user
// @route GET /api/admin/dashboard
exports.getDashboardData = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [notesCount, tasksCount, docsCount, filesCount, recentNotes, recentTasks, recentDocs] =
      await Promise.all([
        Note.countDocuments({ userId }),
        Task.countDocuments({ userId }),
        Document.countDocuments({ userId }),
        File.countDocuments({ userId }),
        Note.find({ userId }).sort({ updatedAt: -1 }).limit(5).select('title updatedAt color'),
        Task.find({ userId }).sort({ createdAt: -1 }).limit(5).select('goal priority progress deadline'),
        Document.find({ userId }).sort({ createdAt: -1 }).limit(5).select('originalName mimeType fileSize createdAt'),
      ]);

    // Task progress breakdown
    const taskStatusCounts = await Task.aggregate([
      { $match: { userId } },
      { $unwind: '$tasks' },
      { $group: { _id: '$tasks.status', count: { $sum: 1 } } },
    ]);

    sendSuccess(res, 200, 'Dashboard data fetched', {
      stats: { notesCount, tasksCount, docsCount, filesCount },
      recentNotes,
      recentTasks,
      recentDocs,
      taskStatusCounts, // [{ _id: 'todo'|'in-progress'|'done', count: N }]
    });
  } catch (error) {
    next(error);
  }
};

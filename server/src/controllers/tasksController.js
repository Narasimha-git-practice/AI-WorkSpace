const Task = require('../models/Task');
const { sendSuccess, sendError } = require('../utils/response');

// @desc  Get all task boards for the logged-in user
// @route GET /api/tasks
exports.getTasks = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = { userId: req.user._id };
    if (search) query.$text = { $search: search };

    const skip = (page - 1) * limit;
    const [tasks, total] = await Promise.all([
      Task.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Task.countDocuments(query),
    ]);

    sendSuccess(res, 200, 'Tasks fetched', tasks, { total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

// @desc  Create a new task board manually
// @route POST /api/tasks
exports.createTask = async (req, res, next) => {
  try {
    const task = await Task.create({ ...req.body, userId: req.user._id });
    sendSuccess(res, 201, 'Task created', task);
  } catch (error) {
    next(error);
  }
};

// @desc  Get a single task board
// @route GET /api/tasks/:id
exports.getTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    if (!task) return sendError(res, 404, 'Task not found');
    sendSuccess(res, 200, 'Task fetched', task);
  } catch (error) {
    next(error);
  }
};

// @desc  Update a task board (goal, deadline, priority)
// @route PUT /api/tasks/:id
exports.updateTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    if (!task) return sendError(res, 404, 'Task not found');

    Object.assign(task, req.body);
    task.progress = task.calculateProgress();
    await task.save();
    sendSuccess(res, 200, 'Task updated', task);
  } catch (error) {
    next(error);
  }
};

// @desc  Update status of a specific task item (or its subtask)
// @route PATCH /api/tasks/:id/items/:taskItemId
exports.updateTaskItem = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    if (!task) return sendError(res, 404, 'Task not found');

    const taskItem = task.tasks.id(req.params.taskItemId);
    if (!taskItem) return sendError(res, 404, 'Task item not found');

    taskItem.status = req.body.status || taskItem.status;
    if (req.body.subtaskIndex !== undefined) {
      taskItem.subtasks[req.body.subtaskIndex].completed = req.body.completed;
    }
    task.progress = task.calculateProgress();
    await task.save();
    sendSuccess(res, 200, 'Task item updated', task);
  } catch (error) {
    next(error);
  }
};

// @desc  Delete a task board
// @route DELETE /api/tasks/:id
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!task) return sendError(res, 404, 'Task not found');
    sendSuccess(res, 200, 'Task deleted');
  } catch (error) {
    next(error);
  }
};

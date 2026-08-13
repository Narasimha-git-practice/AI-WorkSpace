const express = require('express');
const router = express.Router();
const { getTasks, createTask, getTask, updateTask, updateTaskItem, deleteTask } = require('../controllers/tasksController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.route('/').get(getTasks).post(createTask);
router.route('/:id').get(getTask).put(updateTask).delete(deleteTask);
router.patch('/:id/items/:taskItemId', updateTaskItem);

module.exports = router;

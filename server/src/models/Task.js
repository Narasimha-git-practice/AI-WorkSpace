const mongoose = require('mongoose');

const subtaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
});

const taskItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
  estimatedTime: { type: String, default: '' },
  subtasks: [subtaskSchema],
  status: { type: String, enum: ['todo', 'in-progress', 'done'], default: 'todo' },
  order: { type: Number, default: 0 },
});

const taskSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    goal: { type: String, required: [true, 'Goal is required'], trim: true },
    deadline: { type: Date },
    priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
    tasks: [taskItemSchema],
    progress: { type: Number, default: 0, min: 0, max: 100 },
  },
  { timestamps: true }
);

// Calculate progress from task items
taskSchema.methods.calculateProgress = function () {
  if (!this.tasks.length) return 0;
  const done = this.tasks.filter((t) => t.status === 'done').length;
  return Math.round((done / this.tasks.length) * 100);
};

taskSchema.index({ goal: 'text' });

module.exports = mongoose.model('Task', taskSchema);

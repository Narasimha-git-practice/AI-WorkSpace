const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: [true, 'Note title is required'], trim: true, maxlength: [200, 'Title cannot exceed 200 characters'] },
    content: { type: String, default: '' },
    tags: [{ type: String, trim: true, lowercase: true }],
    color: { type: String, default: '#6366f1' },
    isPinned: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
    isFavorite: { type: Boolean, default: false },
    wordCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Auto-calculate word count on save
noteSchema.pre('save', function (next) {
  this.wordCount = this.content ? this.content.split(/\s+/).filter(Boolean).length : 0;
  next();
});

noteSchema.index({ title: 'text', content: 'text', tags: 'text' });

module.exports = mongoose.model('Note', noteSchema);

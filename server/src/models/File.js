const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    originalName: { type: String, required: true },
    storedName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    mimeType: { type: String, required: true },
    fileSize: { type: Number, required: true },
    folder: { type: String, default: 'Root', trim: true },
    isStarred: { type: Boolean, default: false },
    tags: [{ type: String, trim: true }],
    fileData: { type: String, default: '' }, // Base64 encoded file binary stored in DB
  },
  { timestamps: true }
);

fileSchema.index({ originalName: 'text', folder: 'text', tags: 'text' });

module.exports = mongoose.model('File', fileSchema);

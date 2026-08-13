const mongoose = require('mongoose');

// Document storage — supports PDF, DOCX, and TXT files
// Text is extracted on upload using pdf-parse and mammoth
const documentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    originalName: { type: String, required: true },
    storedName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    mimeType: { type: String, required: true },
    fileSize: { type: Number, required: true },   // in bytes
    extractedText: { type: String, default: '' }, // text content extracted from file
    isProcessed: { type: Boolean, default: true },
    summary: { type: String, default: '' },
    keyPoints: [{ type: String }],
    keywords: [{ type: String }],
    actionItems: [{ type: String }],
    readingTime: { type: String, default: '1 min' },
    fileData: { type: String, default: '' },      // Base64 encoded file binary content stored in DB
  },
  { timestamps: true }
);

documentSchema.index({ originalName: 'text', extractedText: 'text', summary: 'text' });

module.exports = mongoose.model('Document', documentSchema);

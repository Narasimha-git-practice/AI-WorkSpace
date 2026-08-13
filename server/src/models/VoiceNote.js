const mongoose = require('mongoose');

const voiceNoteSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: [true, 'Title is required'], trim: true },
    transcription: { type: String, required: true },
    duration: { type: Number, default: 0 },   // recording duration in seconds
    language: { type: String, default: 'en-US' },
  },
  { timestamps: true }
);

voiceNoteSchema.index({ title: 'text', transcription: 'text' });

module.exports = mongoose.model('VoiceNote', voiceNoteSchema);

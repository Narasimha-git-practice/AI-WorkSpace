const Note = require('../models/Note');
const Task = require('../models/Task');
const Document = require('../models/Document');
const File = require('../models/File');
const VoiceNote = require('../models/VoiceNote');
const { sendSuccess, sendError } = require('../utils/response');

// @desc  Global search across Notes, Tasks, Documents, Files, and Voice Notes
// @route GET /api/search?q=keyword
exports.globalSearch = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) return sendError(res, 400, 'Search query must be at least 2 characters');

    const userId = req.user._id;
    const textQuery = { $text: { $search: q } };
    const userFilter = { userId };

    const [notes, tasks, documents, files, voiceNotes] = await Promise.all([
      Note.find({ ...userFilter, ...textQuery }).limit(5).select('title content tags updatedAt'),
      Task.find({ ...userFilter, ...textQuery }).limit(5).select('goal priority progress updatedAt'),
      Document.find({ ...userFilter, ...textQuery }).limit(5).select('originalName mimeType fileSize createdAt'),
      File.find({ ...userFilter, ...textQuery }).limit(5).select('originalName mimeType fileSize folder createdAt'),
      VoiceNote.find({ ...userFilter, ...textQuery }).limit(5).select('title transcription createdAt'),
    ]);

    const total = notes.length + tasks.length + documents.length + files.length + voiceNotes.length;

    sendSuccess(res, 200, 'Search results', { notes, tasks, documents, files, voiceNotes, total, query: q });
  } catch (error) {
    next(error);
  }
};

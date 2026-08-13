const VoiceNote = require('../models/VoiceNote');
const { sendSuccess, sendError } = require('../utils/response');

// @desc  Get all voice notes for the logged-in user
// @route GET /api/voice
exports.getVoiceNotes = async (req, res, next) => {
  try {
    const notes = await VoiceNote.find({ userId: req.user._id }).sort({ createdAt: -1 });
    sendSuccess(res, 200, 'Voice notes fetched', notes);
  } catch (error) {
    next(error);
  }
};

// @desc  Save a voice note (transcription provided by browser Web Speech API)
// @route POST /api/voice
exports.saveVoiceNote = async (req, res, next) => {
  try {
    const { title, transcription, duration, language } = req.body;
    if (!transcription) return sendError(res, 400, 'Transcription is required');

    const note = await VoiceNote.create({
      userId: req.user._id,
      title,
      transcription,
      duration,
      language,
    });
    sendSuccess(res, 201, 'Voice note saved', note);
  } catch (error) {
    next(error);
  }
};

// @desc  Update a voice note (title / transcription)
// @route PUT /api/voice/:id
exports.updateVoiceNote = async (req, res, next) => {
  try {
    const note = await VoiceNote.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!note) return sendError(res, 404, 'Voice note not found');
    sendSuccess(res, 200, 'Voice note updated', note);
  } catch (error) {
    next(error);
  }
};

// @desc  Delete a voice note
// @route DELETE /api/voice/:id
exports.deleteVoiceNote = async (req, res, next) => {
  try {
    const note = await VoiceNote.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!note) return sendError(res, 404, 'Voice note not found');
    sendSuccess(res, 200, 'Voice note deleted');
  } catch (error) {
    next(error);
  }
};

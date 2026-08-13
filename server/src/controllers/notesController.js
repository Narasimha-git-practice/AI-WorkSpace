const Note = require('../models/Note');
const { sendSuccess, sendError } = require('../utils/response');

// @desc  Get all notes for the logged-in user
// @route GET /api/notes
exports.getNotes = async (req, res, next) => {
  try {
    const { search, tag, isPinned, isArchived, page = 1, limit = 20 } = req.query;
    const query = { userId: req.user._id };

    if (search) query.$text = { $search: search };
    if (tag) query.tags = tag;
    if (isPinned !== undefined) query.isPinned = isPinned === 'true';
    if (isArchived !== undefined) query.isArchived = isArchived === 'true';
    else query.isArchived = false;

    const skip = (page - 1) * limit;
    const [notes, total] = await Promise.all([
      Note.find(query).sort({ isPinned: -1, updatedAt: -1 }).skip(skip).limit(Number(limit)),
      Note.countDocuments(query),
    ]);

    sendSuccess(res, 200, 'Notes fetched', notes, { total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

// @desc  Create a new note
// @route POST /api/notes
exports.createNote = async (req, res, next) => {
  try {
    const note = await Note.create({ ...req.body, userId: req.user._id });
    sendSuccess(res, 201, 'Note created', note);
  } catch (error) {
    next(error);
  }
};

// @desc  Get a single note
// @route GET /api/notes/:id
exports.getNote = async (req, res, next) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user._id });
    if (!note) return sendError(res, 404, 'Note not found');
    sendSuccess(res, 200, 'Note fetched', note);
  } catch (error) {
    next(error);
  }
};

// @desc  Update a note
// @route PUT /api/notes/:id
exports.updateNote = async (req, res, next) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!note) return sendError(res, 404, 'Note not found');
    sendSuccess(res, 200, 'Note updated', note);
  } catch (error) {
    next(error);
  }
};

// @desc  Delete a note
// @route DELETE /api/notes/:id
exports.deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!note) return sendError(res, 404, 'Note not found');
    sendSuccess(res, 200, 'Note deleted');
  } catch (error) {
    next(error);
  }
};

// @desc  Toggle pin status
// @route POST /api/notes/:id/pin
exports.togglePin = async (req, res, next) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user._id });
    if (!note) return sendError(res, 404, 'Note not found');
    note.isPinned = !note.isPinned;
    await note.save();
    sendSuccess(res, 200, `Note ${note.isPinned ? 'pinned' : 'unpinned'}`, note);
  } catch (error) {
    next(error);
  }
};

// @desc  Toggle archive status
// @route POST /api/notes/:id/archive
exports.toggleArchive = async (req, res, next) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user._id });
    if (!note) return sendError(res, 404, 'Note not found');
    note.isArchived = !note.isArchived;
    await note.save();
    sendSuccess(res, 200, `Note ${note.isArchived ? 'archived' : 'unarchived'}`, note);
  } catch (error) {
    next(error);
  }
};

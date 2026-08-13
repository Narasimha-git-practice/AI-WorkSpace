const fs = require('fs');
const path = require('path');
const File = require('../models/File');
const { sendSuccess, sendError } = require('../utils/response');

exports.getFiles = async (req, res, next) => {
  try {
    const { folder, search, page = 1, limit = 30 } = req.query;
    const query = { userId: req.user._id };
    if (folder) query.folder = folder;
    if (search) query.$text = { $search: search };

    const skip = (page - 1) * limit;
    const [files, total] = await Promise.all([
      File.find(query).select('-fileData').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      File.countDocuments(query),
    ]);
    sendSuccess(res, 200, 'Files fetched', files, { total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

exports.uploadFile = async (req, res, next) => {
  try {
    if (!req.file) return sendError(res, 400, 'Please upload a file');
    const fileUrl = `/uploads/files/${req.file.filename}`;
    const filePath = path.join(__dirname, '../../uploads/files', req.file.filename);

    let fileData = '';
    try {
      if (fs.existsSync(filePath)) {
        const buffer = fs.readFileSync(filePath);
        fileData = `data:${req.file.mimetype};base64,${buffer.toString('base64')}`;
      }
    } catch (e) {
      console.error('File DB payload error:', e.message);
    }

    const file = await File.create({
      userId: req.user._id,
      originalName: req.file.originalname,
      storedName: req.file.filename,
      fileUrl,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      folder: req.body.folder || 'Root',
      fileData,
    });
    sendSuccess(res, 201, 'File uploaded', file);
  } catch (error) {
    next(error);
  }
};

exports.renameFile = async (req, res, next) => {
  try {
    const file = await File.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { originalName: req.body.name },
      { new: true }
    );
    if (!file) return sendError(res, 404, 'File not found');
    sendSuccess(res, 200, 'File renamed', file);
  } catch (error) {
    next(error);
  }
};

exports.deleteFile = async (req, res, next) => {
  try {
    const file = await File.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!file) return sendError(res, 404, 'File not found');

    const filePath = path.join(__dirname, '../../uploads/files', file.storedName);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    sendSuccess(res, 200, 'File deleted');
  } catch (error) {
    next(error);
  }
};

exports.toggleStar = async (req, res, next) => {
  try {
    const file = await File.findOne({ _id: req.params.id, userId: req.user._id });
    if (!file) return sendError(res, 404, 'File not found');
    file.isStarred = !file.isStarred;
    await file.save();
    sendSuccess(res, 200, 'File updated', file);
  } catch (error) {
    next(error);
  }
};

exports.getFolders = async (req, res, next) => {
  try {
    const folders = await File.distinct('folder', { userId: req.user._id });
    sendSuccess(res, 200, 'Folders fetched', folders);
  } catch (error) {
    next(error);
  }
};

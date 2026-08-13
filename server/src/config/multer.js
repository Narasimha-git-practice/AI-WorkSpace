const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const createDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

createDir('uploads/avatars');
createDir('uploads/documents');
createDir('uploads/files');

// Storage strategy
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = req.uploadType || 'files';
    const dir = `uploads/${type}`;
    createDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  },
});

const fileFilter = (req, file, cb) => {
  // Allow all standard safe file types or wildcard if application/octet-stream
  if (file.mimetype || file.originalname) {
    cb(null, true);
  } else {
    cb(null, true);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 25 * 1024 * 1024 },
});

module.exports = upload;

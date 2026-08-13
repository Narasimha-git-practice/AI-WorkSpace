const express = require('express');
const router = express.Router();
const { getFiles, uploadFile, renameFile, deleteFile, toggleStar, getFolders } = require('../controllers/filesController');
const { protect } = require('../middleware/auth');
const upload = require('../config/multer');

router.use(protect);
router.get('/folders', getFolders);
router.route('/').get(getFiles).post((req, res, next) => { req.uploadType = 'files'; next(); }, upload.single('file'), uploadFile);
router.patch('/:id/rename', renameFile);
router.post('/:id/star', toggleStar);
router.delete('/:id', deleteFile);

module.exports = router;

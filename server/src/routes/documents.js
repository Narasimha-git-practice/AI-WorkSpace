const express = require('express');
const router = express.Router();
const { uploadDocument, getDocuments, deleteDocument, summarizeDocument } = require('../controllers/documentsController');
const { protect } = require('../middleware/auth');
const upload = require('../config/multer');

router.use(protect);
router.get('/', getDocuments);
router.post('/upload', (req, res, next) => { req.uploadType = 'documents'; next(); }, upload.single('document'), uploadDocument);
router.post('/:id/summarize', summarizeDocument);
router.delete('/:id', deleteDocument);

module.exports = router;

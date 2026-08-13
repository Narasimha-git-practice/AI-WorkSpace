const express = require('express');
const router = express.Router();
const { getVoiceNotes, saveVoiceNote, updateVoiceNote, deleteVoiceNote } = require('../controllers/voiceController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.route('/').get(getVoiceNotes).post(saveVoiceNote);
router.route('/:id').put(updateVoiceNote).delete(deleteVoiceNote);

module.exports = router;

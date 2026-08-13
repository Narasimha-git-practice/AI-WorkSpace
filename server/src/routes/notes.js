const express = require('express');
const router = express.Router();
const { getNotes, createNote, getNote, updateNote, deleteNote, togglePin, toggleArchive } = require('../controllers/notesController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.route('/').get(getNotes).post(createNote);
router.route('/:id').get(getNote).put(updateNote).delete(deleteNote);
router.post('/:id/pin', togglePin);
router.post('/:id/archive', toggleArchive);

module.exports = router;

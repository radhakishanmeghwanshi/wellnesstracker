const express = require('express');
const router = express.Router();
const {
  createJournal,
  getJournals,
  getJournalById,
  updateJournal,
  deleteJournal
} = require('../controllers/journalController');
const { protect } = require('../middleware/auth');

// Protect all journal routes
router.use(protect);

router.route('/')
  .post(createJournal)
  .get(getJournals);

router.route('/:id')
  .get(getJournalById)
  .put(updateJournal)
  .delete(deleteJournal);

module.exports = router;

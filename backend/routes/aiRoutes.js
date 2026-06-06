const express = require('express');
const router = express.Router();
const { reflectOnJournal, previewReflection } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

// Protect all AI reflection endpoints
router.use(protect);

router.post('/reflect/:journalId', reflectOnJournal);
router.post('/preview', previewReflection);

module.exports = router;

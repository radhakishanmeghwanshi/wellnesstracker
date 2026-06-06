const express = require('express');
const router = express.Router();
const { logMood, getMoodHistory, getMoodAnalytics } = require('../controllers/moodController');
const { protect } = require('../middleware/auth');

// Protect all routes within this router
router.use(protect);

router.post('/', logMood);
router.get('/', getMoodHistory);
router.get('/analytics', getMoodAnalytics);

module.exports = router;

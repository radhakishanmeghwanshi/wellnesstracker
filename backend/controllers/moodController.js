const Mood = require('../models/Mood');

// @desc    Log a new mood
// @route   POST /api/moods
// @access  Private
const logMood = async (req, res) => {
  const { score, tags, note } = req.body;

  try {
    if (score === undefined || score < 1 || score > 5) {
      return res.status(400).json({ success: false, message: 'Please provide a valid mood score between 1 and 5' });
    }

    if (global.useMockDB) {
      const newMood = {
        _id: 'mock_m_' + Date.now(),
        user: req.user._id.toString(),
        score,
        tags: tags || [],
        note: note || '',
        createdAt: new Date()
      };
      global.mockMoods.push(newMood);
      return res.status(201).json({
        success: true,
        data: newMood
      });
    }

    const mood = await Mood.create({
      user: req.user._id,
      score,
      tags: tags || [],
      note: note || ''
    });

    return res.status(201).json({
      success: true,
      data: mood
    });
  } catch (error) {
    console.error('Log mood error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's mood history
// @route   GET /api/moods
// @access  Private
const getMoodHistory = async (req, res) => {
  try {
    if (global.useMockDB) {
      const userMoods = global.mockMoods.filter(m => m.user === req.user._id.toString())
        .sort((a, b) => b.createdAt - a.createdAt);
      return res.json({
        success: true,
        count: userMoods.length,
        data: userMoods
      });
    }

    const moods = await Mood.find({ user: req.user._id }).sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: moods.length,
      data: moods
    });
  } catch (error) {
    console.error('Get mood history error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get mood analytics data
// @route   GET /api/moods/analytics
// @access  Private
const getMoodAnalytics = async (req, res) => {
  try {
    const userId = req.user._id.toString();

    // Fetch moods from the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    let moods;
    if (global.useMockDB) {
      moods = global.mockMoods.filter(m => m.user === userId && m.createdAt >= thirtyDaysAgo)
        .sort((a, b) => a.createdAt - b.createdAt);
    } else {
      moods = await Mood.find({
        user: userId,
        createdAt: { $gte: thirtyDaysAgo }
      }).sort({ createdAt: 1 });
    }

    if (moods.length === 0) {
      return res.json({
        success: true,
        data: {
          averageScore: 0,
          distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          tagCounts: {},
          history: []
        }
      });
    }

    let totalScore = 0;
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const tagCounts = {};
    const history = [];

    moods.forEach(mood => {
      totalScore += mood.score;
      distribution[mood.score] = (distribution[mood.score] || 0) + 1;
      
      if (mood.tags && Array.isArray(mood.tags)) {
        mood.tags.forEach(tag => {
          if (tag) {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          }
        });
      }

      // Format date to local date string (YYYY-MM-DD)
      const dateStr = mood.createdAt.toISOString().split('T')[0];
      history.push({
        _id: mood._id,
        date: dateStr,
        score: mood.score,
        tags: mood.tags,
        note: mood.note
      });
    });

    const averageScore = Number((totalScore / moods.length).toFixed(2));

    return res.json({
      success: true,
      data: {
        averageScore,
        distribution,
        tagCounts,
        history
      }
    });
  } catch (error) {
    console.error('Mood analytics error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  logMood,
  getMoodHistory,
  getMoodAnalytics
};

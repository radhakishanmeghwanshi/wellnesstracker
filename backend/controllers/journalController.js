const Journal = require('../models/Journal');

// @desc    Create a new journal entry
// @route   POST /api/journals
// @access  Private
const createJournal = async (req, res) => {
  const { title, content, moodScore } = req.body;

  try {
    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Please provide both title and content' });
    }

    if (global.useMockDB) {
      const newJournal = {
        _id: 'mock_j_' + Date.now(),
        user: req.user._id.toString(),
        title,
        content,
        moodScore,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      global.mockJournals.push(newJournal);
      return res.status(201).json({
        success: true,
        data: newJournal
      });
    }

    const journal = await Journal.create({
      user: req.user._id,
      title,
      content,
      moodScore
    });

    return res.status(201).json({
      success: true,
      data: journal
    });
  } catch (error) {
    console.error('Create journal error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all user journals (with search and date filters)
// @route   GET /api/journals
// @access  Private
const getJournals = async (req, res) => {
  try {
    const userId = req.user._id.toString();

    if (global.useMockDB) {
      let filtered = global.mockJournals.filter(j => j.user === userId);

      // Search query filter
      if (req.query.search) {
        const term = req.query.search.toLowerCase();
        filtered = filtered.filter(j => 
          j.title.toLowerCase().includes(term) || 
          j.content.toLowerCase().includes(term)
        );
      }

      // Date range filter
      if (req.query.startDate) {
        const start = new Date(req.query.startDate);
        filtered = filtered.filter(j => j.createdAt >= start);
      }
      if (req.query.endDate) {
        const end = new Date(req.query.endDate);
        end.setHours(23, 59, 59, 999);
        filtered = filtered.filter(j => j.createdAt <= end);
      }

      // Sort by creation date descending
      filtered.sort((a, b) => b.createdAt - a.createdAt);

      return res.json({
        success: true,
        count: filtered.length,
        data: filtered
      });
    }

    const query = { user: req.user._id };

    // Full-text search
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }

    // Date range filter
    if (req.query.startDate || req.query.endDate) {
      query.createdAt = {};
      if (req.query.startDate) {
        query.createdAt.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        // Set time to the end of the day (23:59:59.999) to include entries made on that day
        const end = new Date(req.query.endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    // Sort by creation date descending
    const journals = await Journal.find(query).sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: journals.length,
      data: journals
    });
  } catch (error) {
    console.error('Get journals error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single journal entry
// @route   GET /api/journals/:id
// @access  Private
const getJournalById = async (req, res) => {
  try {
    const userId = req.user._id.toString();

    if (global.useMockDB) {
      const journal = global.mockJournals.find(j => j._id === req.params.id && j.user === userId);
      if (!journal) {
        return res.status(404).json({ success: false, message: 'Journal entry not found' });
      }
      return res.json({
        success: true,
        data: journal
      });
    }

    const journal = await Journal.findOne({ _id: req.params.id, user: req.user._id });

    if (!journal) {
      return res.status(404).json({ success: false, message: 'Journal entry not found' });
    }

    return res.json({
      success: true,
      data: journal
    });
  } catch (error) {
    console.error('Get journal by id error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update journal entry
// @route   PUT /api/journals/:id
// @access  Private
const updateJournal = async (req, res) => {
  const { title, content, moodScore, aiReflection } = req.body;
  const userId = req.user._id.toString();

  try {
    if (global.useMockDB) {
      const index = global.mockJournals.findIndex(j => j._id === req.params.id && j.user === userId);
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Journal entry not found' });
      }

      let journal = global.mockJournals[index];
      if (title) journal.title = title;
      if (content) journal.content = content;
      if (moodScore !== undefined) journal.moodScore = moodScore;
      if (aiReflection) journal.aiReflection = aiReflection;
      journal.updatedAt = new Date();

      global.mockJournals[index] = journal;

      return res.json({
        success: true,
        data: journal
      });
    }

    let journal = await Journal.findOne({ _id: req.params.id, user: req.user._id });

    if (!journal) {
      return res.status(404).json({ success: false, message: 'Journal entry not found' });
    }

    // Update fields
    if (title) journal.title = title;
    if (content) journal.content = content;
    if (moodScore !== undefined) journal.moodScore = moodScore;
    if (aiReflection) journal.aiReflection = aiReflection;
    journal.updatedAt = Date.now();

    await journal.save();

    return res.json({
      success: true,
      data: journal
    });
  } catch (error) {
    console.error('Update journal error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete journal entry
// @route   DELETE /api/journals/:id
// @access  Private
const deleteJournal = async (req, res) => {
  const userId = req.user._id.toString();

  try {
    if (global.useMockDB) {
      const index = global.mockJournals.findIndex(j => j._id === req.params.id && j.user === userId);
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Journal entry not found or unauthorized' });
      }
      global.mockJournals.splice(index, 1);
      return res.json({
        success: true,
        message: 'Journal entry deleted successfully'
      });
    }

    const result = await Journal.deleteOne({ _id: req.params.id, user: req.user._id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'Journal entry not found or unauthorized' });
    }

    return res.json({
      success: true,
      message: 'Journal entry deleted successfully'
    });
  } catch (error) {
    console.error('Delete journal error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createJournal,
  getJournals,
  getJournalById,
  updateJournal,
  deleteJournal
};

const mongoose = require('mongoose');

const journalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Please add some content for your journal'],
    trim: true
  },
  moodScore: {
    type: Number,
    min: 1,
    max: 5
  },
  aiReflection: {
    reflection: { type: String },
    sentiment: { type: String },
    distressLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'severe'],
      default: 'low'
    },
    actionableTips: [{ type: String }],
    crisisDetected: { type: Boolean, default: false }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create text index for search on title and content
journalSchema.index({ title: 'text', content: 'text' });

module.exports = mongoose.model('Journal', journalSchema);

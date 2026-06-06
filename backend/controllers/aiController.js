const Mood = require('../models/Mood');
const Journal = require('../models/Journal');
const { OpenAI } = require('openai');

// Initialize OpenAI client if API key is provided
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

// Crisis keywords safety list
const CRITICAL_KEYWORDS = [
  'suicide', 'kill myself', 'end my life', 'want to die', 'harm myself',
  'self harm', 'self-harm', 'cutting myself', 'overdose', 'better off dead',
  'killing myself', 'end it all', 'hang myself', 'slit my wrist', 'suicidal'
];

// Helper to check if text contains crisis keywords
const checkCrisis = (text) => {
  if (!text) return false;
  const lowercaseText = text.toLowerCase();
  return CRITICAL_KEYWORDS.some(keyword => lowercaseText.includes(keyword));
};

// Standard crisis response payload
const CRISIS_RESPONSE = {
  reflection: "It sounds like you are going through an incredibly challenging time, and I want you to know that you are not alone. There is support available right now.",
  sentiment: "Severe Distress",
  distressLevel: "severe",
  actionableTips: [
    "Call or text 988 to connect with the Suicide & Crisis Lifeline (US/Canada). It is free, confidential, and available 24/7.",
    "Text HOME to 741741 to connect with the Crisis Text Line.",
    "If you are outside the US or Canada, please contact your local emergency response services or find support resources at https://findahelpline.com/",
    "Reach out to a counselor, mental health professional, or a trusted person in your life immediately."
  ],
  crisisDetected: true
};

// Generate realistic mock responses if OpenAI API is not configured
const getMockReflection = (journalText, moodScore) => {
  const content = (journalText || '').toLowerCase();
  
  let sentiment = 'neutral';
  let distressLevel = 'low';
  let reflection = 'Thank you for taking the time to journal. Writing down your thoughts is a wonderful step towards understanding your emotions and processing your experiences.';
  let actionableTips = [
    'Take a few slow, deep breaths, inhaling for 4 seconds and exhaling for 4.',
    'Write down one thing you are grateful for today, no matter how small.'
  ];

  // If moodScore is low (1 or 2)
  if (moodScore && moodScore <= 2) {
    sentiment = 'struggling';
    distressLevel = 'medium';
    reflection = 'It seems like you are having a difficult day. It is completely natural to experience these feelings, and sharing them through your writing is a healthy release. Be gentle with yourself.';
    actionableTips = [
      'Step away from work or studies for a 15-minute break.',
      'Reach out to a close friend or family member for a light chat.'
    ];
  }

  // Keywords matching
  if (content.includes('sad') || content.includes('lonely') || content.includes('cry') || content.includes('alone')) {
    sentiment = 'sadness';
    distressLevel = 'medium';
    reflection = 'It sounds like you are carrying some sadness or feeling isolated. Validating these feelings is part of healing. Remember that you do not have to carry everything by yourself.';
    actionableTips = [
      'Listen to a comforting song that brings you a sense of peace.',
      'Consider cozying up with a warm beverage and doing a relaxing activity.'
    ];
  } else if (content.includes('stress') || content.includes('exam') || content.includes('study') || content.includes('anxious') || content.includes('worry') || content.includes('overwhelm')) {
    sentiment = 'stressed/anxious';
    distressLevel = 'medium';
    reflection = 'It appears that you are feeling the weight of academic pressure or life expectations. Remember that your worth is not defined by productivity or accomplishments. Taking care of your health comes first.';
    actionableTips = [
      'Try the 5-4-3-2-1 grounding exercise (5 things you see, 4 you feel, 3 you hear, 2 you smell, 1 you taste).',
      'Make a small, clear list of just one or two items to tackle next, and let the rest wait.'
    ];
  } else if (content.includes('angry') || content.includes('mad') || content.includes('hate') || content.includes('frustrated')) {
    sentiment = 'frustrated/angry';
    distressLevel = 'medium';
    reflection = 'You are feeling some understandable anger or frustration right now. Acknowledging anger is healthy—it is a signal that something needs to change or that a boundary was crossed.';
    actionableTips = [
      'Engage in a physical release like a brisk walk, stretching, or tearing up scrap paper.',
      'Write down all of your frustrations on paper, then safely throw it away to release the energy.'
    ];
  } else if (content.includes('happy') || content.includes('excited') || content.includes('glad') || content.includes('proud') || content.includes('good')) {
    sentiment = 'positive/joyful';
    distressLevel = 'low';
    reflection = 'It is wonderful to read about your positive day! Recording and reflecting on these brighter moments helps build lasting resilience and reminds us of what brings us joy.';
    actionableTips = [
      'Take a mental snapshot of this feeling to recall on more difficult days.',
      'Consider expressing appreciation to someone who contributed to your positive experience today.'
    ];
  }

  return {
    reflection,
    sentiment,
    distressLevel,
    actionableTips,
    crisisDetected: false
  };
};

// Helper function to call OpenAI GPT-4o-mini
const getAIReflection = async (journalText, moodContext) => {
  if (!openai) {
    return getMockReflection(journalText, moodContext.avgScore);
  }

  try {
    const prompt = `
      You are a compassionate, supportive AI reflection companion for a student mental wellness application.
      Analyze the student's journal entry and recent mood context, and provide a structured, encouraging response.
      
      Student's Journal Entry:
      "${journalText}"

      Recent Mood Context (past 5 logs):
      - Average Mood Score (1-5): ${moodContext.avgScore}
      - Recent Tags: ${moodContext.tags.join(', ')}

      Your response MUST be a valid JSON object matching the following structure:
      {
        "reflection": "Empathic, validation-focused reflection (2-4 sentences) highlighting their emotional state and offering warm support.",
        "sentiment": "Short phrase representing the emotional tone (e.g. anxious, neutral, joyful, overwhelmed).",
        "distressLevel": "One of 'low', 'medium', 'high', or 'severe'.",
        "actionableTips": [
          "Coping tip 1 (concrete and low-barrier)",
          "Coping tip 2 (concrete and low-barrier)"
        ]
      }
      Do not include any markdown syntax wrappers, backticks, or text before/after the JSON. Respond ONLY with the raw JSON.
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a warm, non-judgmental wellness reflection assistant. You respond only with raw, valid JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 450
    });

    const rawContent = response.choices[0].message.content.trim();
    let cleanedContent = rawContent;
    
    // Clean up potential markdown formatting
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.substring(7);
    }
    if (cleanedContent.endsWith('```')) {
      cleanedContent = cleanedContent.substring(0, cleanedContent.length - 3);
    }
    cleanedContent = cleanedContent.trim();

    return JSON.parse(cleanedContent);
  } catch (error) {
    console.error('OpenAI Request failed, fallback to mock:', error);
    return getMockReflection(journalText, moodContext.avgScore);
  }
};

// @desc    Analyze a specific journal entry by ID and return/save its AI reflection
// @route   POST /api/ai/reflect/:journalId
// @access  Private
const reflectOnJournal = async (req, res) => {
  try {
    let journal;
    if (global.useMockDB) {
      journal = global.mockJournals.find(j => j._id === req.params.journalId && j.user === req.user._id.toString());
    } else {
      journal = await Journal.findOne({ _id: req.params.journalId, user: req.user._id });
    }

    if (!journal) {
      return res.status(404).json({ success: false, message: 'Journal entry not found' });
    }

    // Safety checks
    if (checkCrisis(journal.title) || checkCrisis(journal.content)) {
      journal.aiReflection = CRISIS_RESPONSE;
      if (!global.useMockDB) {
        await journal.save();
      } else {
        const index = global.mockJournals.findIndex(j => j._id === journal._id);
        if (index !== -1) global.mockJournals[index] = journal;
      }
      return res.json({
        success: true,
        data: CRISIS_RESPONSE
      });
    }

    // Fetch last 5 mood logs for context
    let recentMoods;
    if (global.useMockDB) {
      recentMoods = global.mockMoods.filter(m => m.user === req.user._id.toString())
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 5);
    } else {
      recentMoods = await Mood.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .limit(5);
    }

    let avgScore = journal.moodScore || 3;
    let tags = [];

    if (recentMoods.length > 0) {
      const total = recentMoods.reduce((sum, m) => sum + m.score, 0);
      avgScore = Number((total / recentMoods.length).toFixed(1));
      recentMoods.forEach(m => {
        tags = [...tags, ...m.tags];
      });
      tags = [...new Set(tags)]; // Unique tags
    }

    const reflectionData = await getAIReflection(journal.content, { avgScore, tags });
    
    // Validate output structure and sanitize distress level
    const sanitizedReflection = {
      reflection: reflectionData.reflection || 'Thank you for writing down your thoughts.',
      sentiment: reflectionData.sentiment || 'neutral',
      distressLevel: ['low', 'medium', 'high', 'severe'].includes(reflectionData.distressLevel) ? reflectionData.distressLevel : 'low',
      actionableTips: Array.isArray(reflectionData.actionableTips) ? reflectionData.actionableTips : ['Take a short break.'],
      crisisDetected: false
    };

    journal.aiReflection = sanitizedReflection;
    if (!global.useMockDB) {
      await journal.save();
    } else {
      const index = global.mockJournals.findIndex(j => j._id === journal._id);
      if (index !== -1) global.mockJournals[index] = journal;
    }

    return res.json({
      success: true,
      data: sanitizedReflection
    });
  } catch (error) {
    console.error('Journal reflection error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Generate a reflection preview (raw data, unsaved)
// @route   POST /api/ai/preview
// @access  Private
const previewReflection = async (req, res) => {
  const { title, content, moodScore } = req.body;

  try {
    if (!content) {
      return res.status(400).json({ success: false, message: 'Please provide content for reflection' });
    }

    // Safety check
    if (checkCrisis(title) || checkCrisis(content)) {
      return res.json({
        success: true,
        data: CRISIS_RESPONSE
      });
    }

    // Fetch user mood context
    let recentMoods;
    if (global.useMockDB) {
      recentMoods = global.mockMoods.filter(m => m.user === req.user._id.toString())
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 5);
    } else {
      recentMoods = await Mood.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .limit(5);
    }

    let avgScore = moodScore || 3;
    let tags = [];

    if (recentMoods.length > 0) {
      const total = recentMoods.reduce((sum, m) => sum + m.score, 0);
      avgScore = Number((total / recentMoods.length).toFixed(1));
      recentMoods.forEach(m => {
        tags = [...tags, ...m.tags];
      });
      tags = [...new Set(tags)];
    }

    const reflectionData = await getAIReflection(content, { avgScore, tags });

    const sanitizedReflection = {
      reflection: reflectionData.reflection || 'Thank you for writing down your thoughts.',
      sentiment: reflectionData.sentiment || 'neutral',
      distressLevel: ['low', 'medium', 'high', 'severe'].includes(reflectionData.distressLevel) ? reflectionData.distressLevel : 'low',
      actionableTips: Array.isArray(reflectionData.actionableTips) ? reflectionData.actionableTips : ['Take a short break.'],
      crisisDetected: false
    };

    return res.json({
      success: true,
      data: sanitizedReflection
    });
  } catch (error) {
    console.error('Preview reflection error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  reflectOnJournal,
  previewReflection
};

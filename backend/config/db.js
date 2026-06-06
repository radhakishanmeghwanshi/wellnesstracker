const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mental-wellness';
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 2000
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    global.useMockDB = false;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.log('--------------------------------------------------');
    console.log('WARNING: No running MongoDB instance found.');
    console.log('Falling back to IN-MEMORY MOCK DATABASE MODE.');
    console.log('All changes will be saved in-memory and reset when server restarts.');
    console.log('--------------------------------------------------');
    global.useMockDB = true;

    // Seed shared in-memory DB for demo purposes
    global.mockMoods = [
      {
        _id: 'm1',
        user: '507f1f77bcf86cd799439011',
        score: 4,
        tags: ['happy', 'calm'],
        note: 'Had a productive study session and got some rest.',
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
      },
      {
        _id: 'm2',
        user: '507f1f77bcf86cd799439011',
        score: 2,
        tags: ['anxious', 'tired'],
        note: 'Felt overwhelmed by upcoming midterm exam.',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        _id: 'm3',
        user: '507f1f77bcf86cd799439011',
        score: 3,
        tags: ['neutral'],
        note: 'Normal day. Attended classes, nothing special.',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        _id: 'm4',
        user: '507f1f77bcf86cd799439011',
        score: 1,
        tags: ['sad', 'lonely'],
        note: 'Feeling homesick today, missing my family and friends.',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        _id: 'm5',
        user: '507f1f77bcf86cd799439011',
        score: 5,
        tags: ['excited', 'happy'],
        note: 'Aced my exam and had a great dinner with roommate!',
        createdAt: new Date()
      }
    ];

    global.mockJournals = [
      {
        _id: 'j1',
        user: '507f1f77bcf86cd799439011',
        title: 'Starting the New Semester',
        content: 'It has been a busy first week. Keeping up with college lectures is tough, but I am excited about my classes. The campus looks beautiful in the autumn. I hope I can maintain my routine and get decent grades.',
        moodScore: 4,
        aiReflection: {
          reflection: 'You are showing a positive and constructive attitude towards the new semester. Recognizing that it is busy yet exciting demonstrates your readiness to take on challenges. The beauty of the campus serves as a lovely grounding point for you.',
          sentiment: 'excited/optimistic',
          distressLevel: 'low',
          actionableTips: [
            'Establish a consistent weekly calendar routine early in the term.',
            'Plan a short 10-minute walk around the campus when you feel study fatigue.'
          ],
          crisisDetected: false
        },
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
      },
      {
        _id: 'j2',
        user: '507f1f77bcf86cd799439011',
        title: 'Feeling Overwhelmed and Anxious',
        content: 'I feel completely overwhelmed by the midterm next week. I have so much content to study and I do not know where to begin. It makes me anxious just thinking about it, and I am struggling to focus. I am worried I will fail.',
        moodScore: 2,
        aiReflection: {
          reflection: 'It is very common to feel overwhelmed when faced with exams. It shows how much you care, but remember that your wellness matters most. Taking it one day at a time can ease the burden.',
          sentiment: 'stressed/anxious',
          distressLevel: 'medium',
          actionableTips: [
            'Break down your study topics into 30-minute blocks using the Pomodoro technique.',
            'Focus on reviewing just one concept today rather than looking at the entire syllabus.'
          ],
          crisisDetected: false
        },
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        _id: 'j3',
        user: '507f1f77bcf86cd799439011',
        title: 'Finding Joy in Small Things',
        content: 'Today was awesome. I went for a run in the morning, got lunch with my friends, and finally finished my programming assignment. Feeling really proud of my progress and glad I stayed active.',
        moodScore: 5,
        aiReflection: {
          reflection: 'Congratulations on an amazing day! Celebrating achievements like completing your assignment and staying active builds positive emotional momentum. Savoring this success is a fantastic resilience practice.',
          sentiment: 'joyful/proud',
          distressLevel: 'low',
          actionableTips: [
            'Note what made today feel so balanced and see if you can replicate it next week.',
            'Give yourself a small reward for completing your programming project.'
          ],
          crisisDetected: false
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }
};

module.exports = connectDB;

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Mood = require('../models/Mood');
const Journal = require('../models/Journal');

// Load environment variables
dotenv.config();

const seedData = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mental-wellness';
    console.log('Connecting to database:', mongoURI);
    await mongoose.connect(mongoURI);

    // Clear existing collections
    console.log('Clearing existing collections...');
    await User.deleteMany({});
    await Mood.deleteMany({});
    await Journal.deleteMany({});

    console.log('Creating test user...');
    // User save middleware hashes password123 automatically
    const testUser = await User.create({
      name: 'Test Student',
      email: 'test@wellness.edu',
      password: 'password123'
    });

    console.log(`Test user created: ${testUser.email}`);

    console.log('Seeding mock moods...');
    const baseDate = new Date();
    const moodEntries = [
      {
        user: testUser._id,
        score: 4,
        tags: ['happy', 'calm'],
        note: 'Had a productive study session and got some rest.',
        createdAt: new Date(new Date().setDate(baseDate.getDate() - 4))
      },
      {
        user: testUser._id,
        score: 2,
        tags: ['anxious', 'tired'],
        note: 'Felt overwhelmed by upcoming midterm exam.',
        createdAt: new Date(new Date().setDate(baseDate.getDate() - 3))
      },
      {
        user: testUser._id,
        score: 3,
        tags: ['neutral'],
        note: 'Normal day. Attended classes, nothing special.',
        createdAt: new Date(new Date().setDate(baseDate.getDate() - 2))
      },
      {
        user: testUser._id,
        score: 1,
        tags: ['sad', 'lonely'],
        note: 'Feeling homesick today, missing my family and friends.',
        createdAt: new Date(new Date().setDate(baseDate.getDate() - 1))
      },
      {
        user: testUser._id,
        score: 5,
        tags: ['excited', 'happy'],
        note: 'Aced my exam and had a great dinner with roommate!',
        createdAt: new Date()
      }
    ];

    await Mood.insertMany(moodEntries);
    console.log('Seeded 5 mood entries.');

    console.log('Seeding mock journals...');
    const journalEntries = [
      {
        user: testUser._id,
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
        createdAt: new Date(new Date().setDate(baseDate.getDate() - 4))
      },
      {
        user: testUser._id,
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
        createdAt: new Date(new Date().setDate(baseDate.getDate() - 3))
      },
      {
        user: testUser._id,
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
        createdAt: new Date()
      }
    ];

    await Journal.insertMany(journalEntries);
    console.log('Seeded 3 journal entries.');

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();

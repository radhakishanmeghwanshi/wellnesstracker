const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallbackjwtsecret123', {
    expiresIn: '30d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }

    if (global.useMockDB) {
      return res.status(201).json({
        success: true,
        _id: '507f1f77bcf86cd799439013',
        name,
        email,
        token: generateToken('507f1f77bcf86cd799439013')
      });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password
    });

    if (user) {
      return res.status(201).json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id)
      });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    if (global.useMockDB) {
      // In mock mode, allow test@wellness.edu / password123 as demo credentials
      if (email === 'test@wellness.edu' && password === 'password123') {
        return res.json({
          success: true,
          _id: '507f1f77bcf86cd799439011',
          name: 'Test Student',
          email: 'test@wellness.edu',
          token: generateToken('507f1f77bcf86cd799439011')
        });
      } else {
        return res.json({
          success: true,
          _id: '507f1f77bcf86cd799439012',
          name: email.split('@')[0],
          email: email,
          token: generateToken('507f1f77bcf86cd799439012')
        });
      }
    }

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      return res.json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id)
      });
    } else {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    if (global.useMockDB) {
      return res.json({
        success: true,
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        createdAt: new Date()
      });
    }

    const user = await User.findById(req.user._id);

    if (user) {
      return res.json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      });
    } else {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile
};

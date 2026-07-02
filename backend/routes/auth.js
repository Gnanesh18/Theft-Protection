const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../services/dbManager');
const { protect } = require('../middleware/auth');

// JWT Generator
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_jwt_secret_key_123', {
    expiresIn: '30d'
  });
};

const { upload, handleFileUpload } = require('../services/uploadService');

// @route   POST api/auth/register
// @desc    Register a new user (Citizen or Officer)
// @access  Public
router.post('/register', upload.single('idCard'), async (req, res) => {
  const { name, email, password, role, phoneNumber, badgeNumber, department } = req.body;

  try {
    const normalizedEmail = email ? email.trim().toLowerCase() : '';
    // Check if user exists
    const userExists = await db.users.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hashSync(password, salt);

    // Create user object
    const userData = {
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: role || 'citizen',
      phoneNumber,
      isActive: role === 'officer' ? false : true // default false for officers
    };

    if (role === 'officer') {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Police ID card image is required for Officer registration' });
      }
      const host = `${req.protocol}://${req.get('host')}`;
      const uploadResult = await handleFileUpload(req.file, host);
      if (uploadResult) {
        userData.idCardImage = uploadResult.url;
      }
      userData.badgeNumber = badgeNumber;
      userData.department = department;
    }

    const newUser = await db.users.create(userData);

    if (role === 'officer') {
      return res.status(201).json({
        success: true,
        pendingApproval: true,
        message: 'Officer account created successfully. Awaiting Admin verification.'
      });
    }

    res.status(201).json({
      success: true,
      data: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        token: generateToken(newUser._id)
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const normalizedEmail = email ? email.trim().toLowerCase() : '';
    const user = await db.users.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated. Please contact support.' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        badgeNumber: user.badgeNumber,
        department: user.department,
        phoneNumber: user.phoneNumber,
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

// @route   POST api/auth/forgot-password
// @desc    Handle forgot password mock response
// @access  Public
router.post('/forgot-password', async (req, res) => {
  const { email, name } = req.body;

  try {
    const normalizedEmail = email ? email.trim().toLowerCase() : '';
    const normalizedName = name ? name.trim().toLowerCase() : '';

    const user = await db.users.findOne({ email: normalizedEmail });
    if (!user || user.name.trim().toLowerCase() !== normalizedName) {
      return res.status(400).json({ success: false, message: 'Identity verification failed. The provided name and email address do not match our records.' });
    }

    // In a real application, we would send a reset email. For our presentation, we log it and send success response.
    console.log(`Password reset link generated for ${email}`);
    
    const origin = req.headers.origin || process.env.FRONTEND_URL || 'http://localhost:5173';
    const frontendUrl = origin.replace(/\/$/, '');
    const resetUrl = `${frontendUrl}/reset-password/${user._id}`;

    // Log request to admin/system log
    await db.systemLogs.create({
      action: 'PASSWORD_RESET_REQUEST',
      details: `Password reset link generated/sent for registered profile: ${user.name} (${normalizedEmail}). Reset URL: ${resetUrl}`,
      performedBy: 'System'
    });
    
    res.json({ 
      success: true, 
      message: 'A password reset link has been successfully generated.',
      resetUrl: resetUrl
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Server error during password reset' });
  }
});

// @route   GET api/auth/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  res.json({
    success: true,
    data: req.user
  });
});

// @route   PUT api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  const { name, phoneNumber, badgeNumber, department } = req.body;

  try {
    const updateData = { name, phoneNumber };
    if (req.user.role === 'officer') {
      updateData.badgeNumber = badgeNumber || req.user.badgeNumber;
      updateData.department = department || req.user.department;
    }

    const updatedUser = await db.users.findByIdAndUpdate(req.user._id, updateData);

    res.json({
      success: true,
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        badgeNumber: updatedUser.badgeNumber,
        department: updatedUser.department,
        phoneNumber: updatedUser.phoneNumber
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ success: false, message: 'Server error during profile update' });
  }
});

// @route   POST api/auth/reset-password/:id
// @desc    Reset password for a user using their ID
// @access  Public
router.post('/reset-password/:id', async (req, res) => {
  const { password } = req.body;
  const userId = req.params.id;

  try {
    const user = await db.users.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User profile not found' });
    }

    // Validate password standard
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasDigit = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!password || password.length < 8 || !hasUpperCase || !hasLowerCase || !hasDigit || !hasSpecialChar) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password does not meet security standard requirements.' 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hashSync(password, salt);

    // Update in database
    await db.users.findByIdAndUpdate(userId, { password: hashedPassword });

    // Log to admin/system log
    await db.systemLogs.create({
      action: 'PASSWORD_RESET_SUCCESS',
      details: `Password successfully updated/changed for registered profile: ${user.name} (${user.email})`,
      performedBy: user.name
    });

    res.json({
      success: true,
      message: 'Your password has been successfully reset. You may now log in.'
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ success: false, message: 'Server error during password reset' });
  }
});

module.exports = router;

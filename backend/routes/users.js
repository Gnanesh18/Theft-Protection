const express = require('express');
const router = express.Router();
const db = require('../services/dbManager');
const { protect, authorize } = require('../middleware/auth');

// @route   GET api/users
// @desc    Get all users (Admin only)
// @access  Private/Admin
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await db.users.find({});
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving users list' });
  }
});

// @route   GET api/users/officers
// @desc    Get all police officers (Admin / Officer access)
// @access  Private (Admin or Officer)
router.get('/officers', protect, authorize('admin', 'officer'), async (req, res) => {
  try {
    const officers = await db.users.find({ role: 'officer' });
    res.json({
      success: true,
      count: officers.length,
      data: officers
    });
  } catch (error) {
    console.error('Get officers error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving officer list' });
  }
});

// @route   PUT api/users/:id/status
// @desc    Activate or deactivate user account (Admin only)
// @access  Private/Admin
router.put('/:id/status', protect, authorize('admin'), async (req, res) => {
  const { isActive } = req.body;

  if (isActive === undefined) {
    return res.status(400).json({ success: false, message: 'Please specify isActive status.' });
  }

  try {
    const targetUser = await db.users.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (targetUser.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Admin account status cannot be modified.' });
    }

    const updatedUser = await db.users.findByIdAndUpdate(req.params.id, { isActive });
    
    res.json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    console.error('Toggle status error:', error);
    res.status(500).json({ success: false, message: 'Server error updating user account status' });
  }
});

// @route   GET api/users/me/notifications
// @desc    Get notifications for logged-in user
// @access  Private
router.get('/me/notifications', protect, async (req, res) => {
  try {
    const notifications = await db.notifications.find({ userId: req.user._id });
    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving notifications' });
  }
});

// @route   PUT api/users/me/notifications/read
// @desc    Mark all user notifications as read
// @access  Private
router.put('/me/notifications/read', protect, async (req, res) => {
  try {
    await db.notifications.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });
    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ success: false, message: 'Server error updating notifications' });
  }
});

// @route   DELETE api/users/:id
// @desc    Delete user account (Admin only)
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const targetUser = await db.users.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    if (targetUser.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Admin account cannot be deleted.' });
    }
    await db.users.findByIdAndDelete(req.params.id);
    res.json({
      success: true,
      message: 'User deleted successfully.'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting user' });
  }
});

// @route   GET api/users/admin/logs
// @desc    Get all administrative/system logs (Admin only)
// @access  Private/Admin
router.get('/admin/logs', protect, authorize('admin'), async (req, res) => {
  try {
    const logs = await db.systemLogs.find({});
    res.json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (error) {
    console.error('Get system logs error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving system audit logs' });
  }
});

module.exports = router;

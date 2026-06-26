const express = require('express');
const router = express.Router();
const db = require('../services/dbManager');
const { protect, authorize } = require('../middleware/auth');

// @route   GET api/analytics
// @desc    Get dashboard metrics, trend lines, and distribution maps (Admin/Officer only)
// @access  Private (Admin or Officer)
router.get('/', protect, authorize('admin', 'officer'), async (req, res) => {
  try {
    const allCases = await db.cases.find({});
    const allUsers = await db.users.find({});

    const totalIncidents = allCases.length;
    const resolvedCases = allCases.filter(c => c.status === 'Resolved').length;
    const pendingCases = allCases.filter(c => c.status !== 'Resolved').length;
    const activeOfficers = allUsers.filter(u => u.role === 'officer' && u.isActive).length;

    // 1. Theft Type Distribution
    const theftTypes = {
      'Mobile Theft': 0,
      'Vehicle Theft': 0,
      'Burglary': 0,
      'Document Theft': 0,
      'Other': 0
    };

    allCases.forEach(c => {
      if (theftTypes[c.theftType] !== undefined) {
        theftTypes[c.theftType]++;
      } else {
        theftTypes['Other']++;
      }
    });

    // 2. Monthly incident trends (past 6 months)
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyTrends = {};

    // Initialize past 6 months to ensure chronological display in graphs
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const label = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      monthlyTrends[label] = 0;
    }

    allCases.forEach(c => {
      const date = new Date(c.incidentDate || c.createdAt);
      const label = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      if (monthlyTrends[label] !== undefined) {
        monthlyTrends[label]++;
      }
    });

    // 3. Resolution Rate Percentage
    const resolutionRate = totalIncidents > 0 ? Math.round((resolvedCases / totalIncidents) * 100) : 0;

    // 4. Status Distribution
    const statusDistribution = {
      'Reported': allCases.filter(c => c.status === 'Reported').length,
      'Assigned': allCases.filter(c => c.status === 'Assigned').length,
      'Investigating': allCases.filter(c => c.status === 'Investigating').length,
      'Evidence Verification': allCases.filter(c => c.status === 'Evidence Verification').length,
      'Resolved': resolvedCases
    };

    res.json({
      success: true,
      data: {
        summary: {
          totalIncidents,
          resolvedCases,
          pendingCases,
          activeOfficers,
          resolutionRate
        },
        theftTypeDistribution: theftTypes,
        monthlyTrends,
        statusDistribution
      }
    });
  } catch (error) {
    console.error('Analytics aggregation error:', error);
    res.status(500).json({ success: false, message: 'Server error compiling analytics data.' });
  }
});

module.exports = router;

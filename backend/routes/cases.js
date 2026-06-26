const express = require('express');
const router = express.Router();
const db = require('../services/dbManager');
const { protect, authorize } = require('../middleware/auth');
const { upload, handleFileUpload } = require('../services/uploadService');
const emailService = require('../services/emailService');

// @route   POST api/cases
// @desc    Report a new theft incident (Citizen only)
// @access  Private/Citizen
router.post('/', protect, upload.array('evidence', 5), async (req, res) => {
  const { theftType, description, incidentDate, coordinates, address } = req.body;

  try {
    if (req.user.role !== 'citizen') {
      return res.status(403).json({ success: false, message: 'Only citizens can submit initial theft reports.' });
    }

    if (!theftType || !description || !incidentDate || !coordinates || !address) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
    }

    // Parse coordinates [longitude, latitude]
    let parsedCoords;
    try {
      parsedCoords = typeof coordinates === 'string' ? JSON.parse(coordinates) : coordinates;
    } catch (err) {
      return res.status(400).json({ success: false, message: 'Invalid coordinates format. Expected [lng, lat].' });
    }

    // Generate Unique Case ID: THF-YYYY-XXX
    const year = new Date().getFullYear();
    const allCases = await db.cases.find({});
    const currentYearCases = allCases.filter(c => c.caseId && c.caseId.startsWith(`THF-${year}-`));
    const nextNum = currentYearCases.length + 1;
    const paddedNum = String(nextNum).padStart(3, '0');
    const caseId = `THF-${year}-${paddedNum}`;

    // Upload evidence files
    const evidenceList = [];
    if (req.files && req.files.length > 0) {
      const host = `${req.protocol}://${req.get('host')}`;
      for (const file of req.files) {
        const fileData = await handleFileUpload(file, host);
        if (fileData) {
          evidenceList.push(fileData);
        }
      }
    }

    const citizenInfo = {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phoneNumber: req.user.phoneNumber
    };

    const newCaseData = {
      caseId,
      citizen: citizenInfo,
      theftType,
      description,
      incidentDate: new Date(incidentDate),
      status: 'Reported',
      priority: 'Medium',
      location: {
        coordinates: parsedCoords,
        address
      },
      evidence: evidenceList,
      assignedOfficer: null,
      officerNotes: [],
      timeline: [
        {
          status: 'Reported',
          description: `Theft case submitted successfully by citizen ${req.user.name}.`,
          timestamp: new Date()
        }
      ]
    };

    const createdCase = await db.cases.create(newCaseData);

    // Create a Notification for the citizen
    await db.notifications.create({
      userId: req.user._id,
      title: 'Case Submitted Successfully',
      message: `Your theft report has been filed. Case ID: ${caseId}.`
    });

    // Send confirmation email
    await emailService.sendCaseCreatedEmail(req.user.email, createdCase);

    res.status(201).json({
      success: true,
      data: createdCase
    });
  } catch (error) {
    console.error('Case reporting error:', error);
    res.status(500).json({ success: false, message: 'Server error during report submission' });
  }
});

// @route   GET api/cases
// @desc    Get cases based on user role (Citizen: own, Officer: assigned/all, Admin: all)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let cases = [];

    if (req.user.role === 'citizen') {
      // Citizen only sees their own cases
      cases = await db.cases.find({ 'citizen._id': req.user._id });
    } else if (req.user.role === 'officer') {
      // Officer sees assigned cases or all cases in precinct
      const { assignedOnly } = req.query;
      if (assignedOnly === 'true') {
        cases = await db.cases.find({ 'assignedOfficer._id': req.user._id });
      } else {
        cases = await db.cases.find({});
      }
    } else if (req.user.role === 'admin') {
      // Admin sees everything
      cases = await db.cases.find({});
    }

    res.json({
      success: true,
      count: cases.length,
      data: cases
    });
  } catch (error) {
    console.error('Get cases error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving cases' });
  }
});

// @route   GET api/cases/:id
// @desc    Get details of a single case
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const targetCase = await db.cases.findById(req.targetId || req.params.id);
    if (!targetCase) {
      // Attempt search by caseId string if numeric ID fails
      const caseByCode = await db.cases.findOne({ caseId: req.params.id });
      if (!caseByCode) {
        return res.status(404).json({ success: false, message: 'Case not found' });
      }
      return res.json({ success: true, data: caseByCode });
    }

    // Security check: Citizens can only see their own cases
    if (req.user.role === 'citizen' && targetCase.citizen._id !== req.user._id) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this case' });
    }

    res.json({
      success: true,
      data: targetCase
    });
  } catch (error) {
    console.error('Get case by ID error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving case details' });
  }
});

// @route   PUT api/cases/:id/status
// @desc    Update status of a case (Officer or Admin)
// @access  Private (Officer/Admin)
router.put('/:id/status', protect, authorize('officer', 'admin'), async (req, res) => {
  const { status, note } = req.body;

  if (!status) {
    return res.status(400).json({ success: false, message: 'Please provide status update.' });
  }

  const validStatuses = ['Reported', 'Assigned', 'Investigating', 'Evidence Verification', 'Resolved'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status update.' });
  }

  try {
    const targetCase = await db.cases.findById(req.params.id);
    if (!targetCase) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    const oldStatus = targetCase.status;
    const updatePayload = { status };

    // Record timeline event
    const timelineEntry = {
      status,
      description: note || `Case status updated to ${status} by Officer ${req.user.name}.`,
      timestamp: new Date()
    };
    
    const timeline = [...targetCase.timeline, timelineEntry];
    updatePayload.timeline = timeline;

    const updatedCase = await db.cases.findByIdAndUpdate(req.params.id, updatePayload);

    // Create Notification for the citizen
    await db.notifications.create({
      userId: targetCase.citizen._id,
      title: 'Case Status Updated',
      message: `Your case (${targetCase.caseId}) status changed to: ${status}.`
    });

    // Send status change email
    await emailService.sendCaseStatusChangedEmail(targetCase.citizen.email, targetCase, oldStatus, status);

    res.json({
      success: true,
      data: updatedCase
    });
  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({ success: false, message: 'Server error updating case status' });
  }
});

// @route   PUT api/cases/:id/assign
// @desc    Assign / reassign officer to case (Admin only)
// @access  Private (Admin)
router.put('/:id/assign', protect, authorize('admin'), async (req, res) => {
  const { officerId } = req.body;

  if (!officerId) {
    return res.status(400).json({ success: false, message: 'Please provide officer ID.' });
  }

  try {
    const targetCase = await db.cases.findById(req.params.id);
    if (!targetCase) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    const officer = await db.users.findById(officerId);
    if (!officer || officer.role !== 'officer') {
      return res.status(400).json({ success: false, message: 'Invalid Officer selected.' });
    }

    const officerInfo = {
      _id: officer._id,
      name: officer.name,
      badgeNumber: officer.badgeNumber,
      phoneNumber: officer.phoneNumber
    };

    const timelineEntry = {
      status: 'Assigned',
      description: `Case assigned to Officer ${officer.name} (${officer.badgeNumber}).`,
      timestamp: new Date()
    };

    // If status is 'Reported', we upgrade it to 'Assigned'
    const status = targetCase.status === 'Reported' ? 'Assigned' : targetCase.status;

    const updatePayload = {
      assignedOfficer: officerInfo,
      status,
      timeline: [...targetCase.timeline, timelineEntry]
    };

    const updatedCase = await db.cases.findByIdAndUpdate(req.params.id, updatePayload);

    // Notification to citizen
    await db.notifications.create({
      userId: targetCase.citizen._id,
      title: 'Officer Assigned',
      message: `Officer ${officer.name} has been assigned to your case ${targetCase.caseId}.`
    });

    // Notification to officer
    await db.notifications.create({
      userId: officer._id,
      title: 'New Case Assigned',
      message: `You have been assigned to case ${targetCase.caseId}.`
    });

    // Send assignment email
    await emailService.sendOfficerAssignedEmail(targetCase.citizen.email, targetCase, officer.name);

    res.json({
      success: true,
      data: updatedCase
    });
  } catch (error) {
    console.error('Assign officer error:', error);
    res.status(500).json({ success: false, message: 'Server error assigning officer' });
  }
});

// @route   POST api/cases/:id/notes
// @desc    Add investigation notes (Officer or Admin)
// @access  Private (Officer/Admin)
router.post('/:id/notes', protect, authorize('officer', 'admin'), async (req, res) => {
  const { note } = req.body;

  if (!note || note.trim() === '') {
    return res.status(400).json({ success: false, message: 'Note content cannot be empty.' });
  }

  try {
    const targetCase = await db.cases.findById(req.params.id);
    if (!targetCase) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    const newNote = {
      note,
      createdAt: new Date(),
      addedBy: req.user.role === 'admin' ? `Admin: ${req.user.name}` : `Officer: ${req.user.name}`
    };

    const officerNotes = [...targetCase.officerNotes, newNote];

    const updatedCase = await db.cases.findByIdAndUpdate(req.params.id, { officerNotes });

    res.json({
      success: true,
      data: updatedCase
    });
  } catch (error) {
    console.error('Add note error:', error);
    res.status(500).json({ success: false, message: 'Server error adding investigator note' });
  }
});

// @route   POST api/cases/:id/evidence
// @desc    Add extra evidence (Citizen, Officer, or Admin)
// @access  Private
router.post('/:id/evidence', protect, upload.array('evidence', 5), async (req, res) => {
  try {
    const targetCase = await db.cases.findById(req.params.id);
    if (!targetCase) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    // Authorization check: Citizens can only upload evidence to their own cases
    if (req.user.role === 'citizen' && targetCase.citizen._id !== req.user._id) {
      return res.status(403).json({ success: false, message: 'Not authorized to add evidence to this case' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No evidence files uploaded.' });
    }

    const host = `${req.protocol}://${req.get('host')}`;
    const newEvidenceList = [];

    for (const file of req.files) {
      const fileData = await handleFileUpload(file, host);
      if (fileData) {
        newEvidenceList.push(fileData);
      }
    }

    const evidence = [...targetCase.evidence, ...newEvidenceList];

    // Record timeline entry
    const timelineEntry = {
      status: targetCase.status,
      description: `New evidence files uploaded by ${req.user.role} ${req.user.name}.`,
      timestamp: new Date()
    };

    const updatedCase = await db.cases.findByIdAndUpdate(req.params.id, {
      evidence,
      timeline: [...targetCase.timeline, timelineEntry]
    });

    res.json({
      success: true,
      data: updatedCase
    });
  } catch (error) {
    console.error('Evidence upload error:', error);
    res.status(500).json({ success: false, message: 'Server error uploading evidence' });
  }
});

module.exports = router;

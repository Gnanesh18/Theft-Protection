const mongoose = require('mongoose');

const CaseSchema = new mongoose.Schema({
  caseId: {
    type: String,
    required: true,
    unique: true
  },
  citizen: {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phoneNumber: { type: String, required: true }
  },
  theftType: {
    type: String,
    enum: ['Mobile Theft', 'Vehicle Theft', 'Burglary', 'Document Theft', 'Other'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  incidentDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Reported', 'Assigned', 'Investigating', 'Evidence Verification', 'Resolved'],
    default: 'Reported'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  location: {
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    },
    address: {
      type: String,
      required: true
    }
  },
  evidence: [
    {
      url: { type: String, required: true },
      type: { type: String, enum: ['image', 'video', 'document'], default: 'image' },
      name: { type: String, required: true }
    }
  ],
  assignedOfficer: {
    _id: { type: String },
    name: { type: String },
    badgeNumber: { type: String },
    phoneNumber: { type: String }
  },
  officerNotes: [
    {
      note: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
      addedBy: { type: String, required: true }
    }
  ],
  timeline: [
    {
      status: { type: String, required: true },
      description: { type: String, required: true },
      timestamp: { type: Date, default: Date.now }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

CaseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Case', CaseSchema);

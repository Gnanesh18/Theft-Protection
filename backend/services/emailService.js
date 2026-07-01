const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const LOG_FILE = process.env.VERCEL 
  ? '/tmp/sent_emails.txt' 
  : path.join(__dirname, '../data/sent_emails.txt');

// Ensure data directory exists
if (!fs.existsSync(path.dirname(LOG_FILE))) {
  fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
}

// Create transporter
let transporter = null;
const useSMTP = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

if (useSMTP) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
  console.log('Email Service: Configured SMTP Transporter.');
} else {
  console.log('Email Service: No SMTP credentials found. Initializing Local Email Logger Fallback.');
}

const sendEmail = async ({ to, subject, text, html }) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || '"Theft Protection Command" <noreply@theftprotection.gov>',
    to,
    subject,
    text,
    html
  };

  if (useSMTP && transporter) {
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`Email sent successfully: ${info.messageId}`);
      return info;
    } catch (error) {
      console.error('SMTP Email sending error, falling back to local log:', error);
      logEmailToDisk(mailOptions);
    }
  } else {
    logEmailToDisk(mailOptions);
  }
};

const logEmailToDisk = (options) => {
  const emailLog = `
========================================
TIMESTAMP: ${new Date().toISOString()}
TO: ${options.to}
FROM: ${options.from}
SUBJECT: ${options.subject}
----------------------------------------
BODY (TEXT):
${options.text}
----------------------------------------
BODY (HTML):
${options.html}
========================================
\n`;

  try {
    fs.appendFileSync(LOG_FILE, emailLog);
    console.log(`[Email Mocked] Email logged to ${LOG_FILE} for ${options.to}`);
  } catch (err) {
    console.error('Failed to log email to disk:', err);
  }
};

const sendCaseCreatedEmail = async (citizenEmail, caseDetails) => {
  const subject = `Theft Case Registered Successfully: ${caseDetails.caseId}`;
  const text = `Hello ${caseDetails.citizen.name},\n\nYour theft incident report has been successfully registered on the Theft Protection platform.\n\nCase ID: ${caseDetails.caseId}\nTheft Type: ${caseDetails.theftType}\nIncident Location: ${caseDetails.location.address}\nStatus: ${caseDetails.status}\n\nYou can track the investigation progress in real time by logging in to the portal.\n\nThank you,\nDigital Theft Protection System`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #1C3F60; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #0B132B; padding: 20px; text-align: center; color: white;">
        <h2>Theft Case Registered</h2>
      </div>
      <div style="padding: 20px; color: #333; line-height: 1.6;">
        <p>Hello <strong>${caseDetails.citizen.name}</strong>,</p>
        <p>Your theft incident report has been successfully registered on the digital Theft Protection platform.</p>
        <div style="background-color: #f8fafc; border-left: 4px solid #1C3F60; padding: 15px; margin: 20px 0;">
          <strong>Case ID:</strong> ${caseDetails.caseId}<br/>
          <strong>Theft Type:</strong> ${caseDetails.theftType}<br/>
          <strong>Incident Location:</strong> ${caseDetails.location.address}<br/>
          <strong>Current Status:</strong> <span style="color: #ef4444; font-weight: bold;">${caseDetails.status}</span>
        </div>
        <p>You can track the progress of your case, view updates, and upload additional evidence at any time by visiting your Citizen Dashboard.</p>
      </div>
      <div style="background-color: #f1f5f9; padding: 10px; text-align: center; font-size: 12px; color: #64748B;">
        This is an automated notification. Please do not reply.
      </div>
    </div>
  `;

  return await sendEmail({ to: citizenEmail, subject, text, html });
};

const sendOfficerAssignedEmail = async (citizenEmail, caseDetails, officerName) => {
  const subject = `Officer Assigned to Case: ${caseDetails.caseId}`;
  const text = `Hello ${caseDetails.citizen.name},\n\nOfficer ${officerName} has been assigned to investigate your case ${caseDetails.caseId}.\n\nThe investigator will review the evidence and contact you if needed. You can check officer notes and progress updates on the portal.\n\nThank you,\nDigital Theft Protection System`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #1C3F60; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #0B132B; padding: 20px; text-align: center; color: white;">
        <h2>Investigating Officer Assigned</h2>
      </div>
      <div style="padding: 20px; color: #333; line-height: 1.6;">
        <p>Hello <strong>${caseDetails.citizen.name}</strong>,</p>
        <p>An officer has been assigned to investigate your theft case.</p>
        <div style="background-color: #f8fafc; border-left: 4px solid #1C3F60; padding: 15px; margin: 20px 0;">
          <strong>Case ID:</strong> ${caseDetails.caseId}<br/>
          <strong>Assigned Investigator:</strong> Officer ${officerName}<br/>
          <strong>Current Status:</strong> <span style="color: #f59e0b; font-weight: bold;">Assigned / Under Investigation</span>
        </div>
        <p>The investigator is currently reviewing your report and evidence. Keep an eye on your dashboard for updates or direct notes from Officer ${officerName}.</p>
      </div>
      <div style="background-color: #f1f5f9; padding: 10px; text-align: center; font-size: 12px; color: #64748B;">
        This is an automated notification. Please do not reply.
      </div>
    </div>
  `;

  return await sendEmail({ to: citizenEmail, subject, text, html });
};

const sendCaseStatusChangedEmail = async (citizenEmail, caseDetails, oldStatus, newStatus) => {
  const subject = `Case Status Updated: ${caseDetails.caseId}`;
  const text = `Hello ${caseDetails.citizen.name},\n\nThe status of your case ${caseDetails.caseId} has changed from ${oldStatus} to ${newStatus}.\n\nPlease log in to check the timeline and recent investigator notes.\n\nThank you,\nDigital Theft Protection System`;
  
  let statusColor = '#EF4444'; // Red for default
  if (newStatus === 'Investigating') statusColor = '#1C3F60';
  if (newStatus === 'Evidence Verification') statusColor = '#F59E0B';
  if (newStatus === 'Resolved') statusColor = '#10B981';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #1C3F60; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #0B132B; padding: 20px; text-align: center; color: white;">
        <h2>Case Progress Update</h2>
      </div>
      <div style="padding: 20px; color: #333; line-height: 1.6;">
        <p>Hello <strong>${caseDetails.citizen.name}</strong>,</p>
        <p>The status of your case has been updated by the investigator.</p>
        <div style="background-color: #f8fafc; border-left: 4px solid ${statusColor}; padding: 15px; margin: 20px 0;">
          <strong>Case ID:</strong> ${caseDetails.caseId}<br/>
          <strong>Previous Status:</strong> ${oldStatus}<br/>
          <strong>New Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${newStatus}</span>
        </div>
        <p>Please log in to your dashboard to review any new notes or details provided by the precinct.</p>
      </div>
      <div style="background-color: #f1f5f9; padding: 10px; text-align: center; font-size: 12px; color: #64748B;">
        This is an automated notification. Please do not reply.
      </div>
    </div>
  `;

  return await sendEmail({ to: citizenEmail, subject, text, html });
};

module.exports = {
  sendEmail,
  sendCaseCreatedEmail,
  sendOfficerAssignedEmail,
  sendCaseStatusChangedEmail
};

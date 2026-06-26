import { jsPDF } from 'jspdf';

export const generateFIRReportPDF = (caseData) => {
  if (!caseData) return;

  const doc = new jsPDF();
  
  // Page Width
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Border Draw
  doc.setDrawColor(28, 63, 96); // Police Blue border
  doc.setLineWidth(1);
  doc.rect(5, 5, pageWidth - 10, doc.internal.pageSize.getHeight() - 10);
  doc.rect(6, 6, pageWidth - 12, doc.internal.pageSize.getHeight() - 12);

  // Official Header
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(11, 19, 43); // Midnight Navy
  doc.text('NATIONAL DIGITAL THEFT PROTECTION AGENCY', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // Slate Gray
  doc.text('SMART SAFETY COMMAND CENTER // CASE DOSSIER DEPT.', pageWidth / 2, 25, { align: 'center' });
  
  // Decorative separator line
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(15, 29, pageWidth - 15, 29);

  // Document Title
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(239, 68, 68); // Crimson for official report
  doc.text(`OFFICIAL FIRST INFORMATION REPORT (FIR)`, pageWidth / 2, 36, { align: 'center' });

  // Grid Info
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59); // Charcoal

  // Row heights
  let y = 48;
  const lineSpacing = 8;

  // General Case Details
  doc.setFont('Helvetica', 'bold');
  doc.text('1. ADMINISTRATIVE DETAILS', 15, y);
  doc.setFont('Helvetica', 'normal');
  y += 6;
  doc.text(`Case Reference ID: ${caseData.caseId}`, 18, y);
  doc.text(`Filing Date/Time: ${new Date(caseData.createdAt).toLocaleString()}`, 105, y);
  
  y += lineSpacing;
  doc.text(`Current Status: ${caseData.status.toUpperCase()}`, 18, y);
  doc.text(`Priority Rank: ${caseData.priority.toUpperCase()}`, 105, y);

  // Citizen Information
  y += 12;
  doc.setFont('Helvetica', 'bold');
  doc.text('2. COMPLAINANT IDENTIFICATION', 15, y);
  doc.setFont('Helvetica', 'normal');
  y += 6;
  doc.text(`Name of Citizen: ${caseData.citizen.name}`, 18, y);
  doc.text(`Contact Number: ${caseData.citizen.phoneNumber}`, 105, y);
  y += lineSpacing;
  doc.text(`Registered Email: ${caseData.citizen.email}`, 18, y);

  // Incident Details
  y += 12;
  doc.setFont('Helvetica', 'bold');
  doc.text('3. INCIDENT SPECIFICATIONS', 15, y);
  doc.setFont('Helvetica', 'normal');
  y += 6;
  doc.text(`Theft Category: ${caseData.theftType}`, 18, y);
  doc.text(`Date of Occurrence: ${new Date(caseData.incidentDate).toLocaleString()}`, 105, y);
  
  y += lineSpacing;
  doc.text('Incident Address:', 18, y);
  doc.setFont('Helvetica', 'oblique');
  const splitAddress = doc.splitTextToSize(caseData.location.address, 150);
  doc.text(splitAddress, 50, y);
  
  y += splitAddress.length * 4.5 + 2;
  doc.setFont('Helvetica', 'normal');
  doc.text(`GPS Mapping Grid: Lat ${caseData.location.coordinates[1].toFixed(6)}, Lng ${caseData.location.coordinates[0].toFixed(6)}`, 18, y);

  // Narrative
  y += 10;
  doc.setFont('Helvetica', 'bold');
  doc.text('4. STATEMENT / CRIME SCENE DESCRIPTION', 15, y);
  doc.setFont('Helvetica', 'normal');
  y += 6;
  const splitDesc = doc.splitTextToSize(caseData.description, 175);
  doc.text(splitDesc, 18, y);

  // Officer Assignment
  y += splitDesc.length * 4.5 + 10;
  doc.setFont('Helvetica', 'bold');
  doc.text('5. ASSIGNED INVESTIGATOR', 15, y);
  doc.setFont('Helvetica', 'normal');
  y += 6;
  if (caseData.assignedOfficer && caseData.assignedOfficer.name) {
    doc.text(`Officer Name: ${caseData.assignedOfficer.name}`, 18, y);
    doc.text(`Badge Number: ${caseData.assignedOfficer.badgeNumber}`, 105, y);
    y += lineSpacing;
    doc.text(`Precinct Contact: ${caseData.assignedOfficer.phoneNumber || '911'}`, 18, y);
  } else {
    doc.setFont('Helvetica', 'oblique');
    doc.text('Case currently in queue. Officer assignment pending.', 18, y);
    doc.setFont('Helvetica', 'normal');
  }

  // Footer / Official Stamps
  y = doc.internal.pageSize.getHeight() - 40;
  doc.setDrawColor(200, 200, 200);
  doc.line(15, y, pageWidth - 15, y);

  y += 10;
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('This document is electronically generated and digitally signed by the smart public safety system.', 15, y);
  doc.text('For updates or follow-ups, visit the digital portal and enter the Case Reference ID.', 15, y + 4);

  // Seal / Sign Mock
  doc.setDrawColor(28, 63, 96);
  doc.rect(pageWidth - 50, y - 5, 35, 18);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(28, 63, 96);
  doc.text('DIGITAL SEAL', pageWidth - 47, y + 2);
  doc.setFontSize(6);
  doc.text('VERIFIED & LOCKED', pageWidth - 48, y + 7);
  doc.text('THEFT PROTECTION SYSTEM', pageWidth - 49, y + 11);

  // Save the PDF
  doc.save(`FIR_REPORT_${caseData.caseId}.pdf`);
};
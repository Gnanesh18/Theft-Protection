import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import { generateFIRReportPDF } from '../utils/pdfGenerator';
import { Shield, Search, Filter, User, Calendar, MapPin, Download, AlertCircle, FilePlus } from 'lucide-react';
import EvidenceGallery from '../components/EvidenceGallery';
import DashboardMap from '../components/DashboardMap';

const OfficerDashboard = () => {
  const { user } = useAuth();
  
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState(null);
  
  // Search / Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Update Case actions state
  const [statusUpdate, setStatusUpdate] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [updating, setUpdating] = useState(false);
  const [actionError, setActionError] = useState('');

  // Extra files upload state
  const [uploadingFiles, setUploadingFiles] = useState(false);

  useEffect(() => {
    fetchOfficerCases();
  }, []);

  const fetchOfficerCases = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/cases`);
      if (res.data.success) {
        setCases(res.data.data);
        if (res.data.data.length > 0) {
          setSelectedCase(res.data.data[0]);
          setStatusUpdate(res.data.data[0].status);
        }
      }
    } catch (err) {
      console.error('Error fetching officer cases:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectCaseFile = (c) => {
    setSelectedCase(c);
    setStatusUpdate(c.status);
    setStatusNote('');
    setNoteInput('');
    setActionError('');
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!statusUpdate) return;
    
    setActionError('');
    setUpdating(true);
    try {
      const res = await axios.put(`${API_URL}/cases/${selectedCase._id}/status`, {
        status: statusUpdate,
        note: statusNote
      });

      if (res.data.success) {
        const updated = cases.map(c => c._id === selectedCase._id ? { ...c, status: statusUpdate, timeline: res.data.data.timeline, updatedAt: new Date().toISOString() } : c);
        setCases(updated);
        setSelectedCase({ ...selectedCase, status: statusUpdate, timeline: res.data.data.timeline, updatedAt: new Date().toISOString() });
        setStatusNote('');
        alert('Case status updated and email alert dispatched.');
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to update case status.');
    } finally {
      setUpdating(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteInput.trim()) return;

    setActionError('');
    setUpdating(true);
    try {
      const res = await axios.post(`${API_URL}/cases/${selectedCase._id}/notes`, {
        note: noteInput.trim()
      });

      if (res.data.success) {
        const updated = cases.map(c => c._id === selectedCase._id ? { ...c, officerNotes: res.data.data.officerNotes, updatedAt: new Date().toISOString() } : c);
        setCases(updated);
        setSelectedCase({ ...selectedCase, officerNotes: res.data.data.officerNotes, updatedAt: new Date().toISOString() });
        setNoteInput('');
        alert('Investigation note logged.');
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to log note.');
    } finally {
      setUpdating(false);
    }
  };

  const handleExtraFilesUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Check if any file exceeds 4MB (Vercel payload limit)
    const maxSize = 4 * 1024 * 1024;
    const oversizedFile = files.find(f => f.size > maxSize);
    if (oversizedFile) {
      alert(`File "${oversizedFile.name}" exceeds the 4MB size limit for secure upload.`);
      return;
    }

    setUploadingFiles(true);
    setActionError('');
    const formPayload = new FormData();
    files.forEach(f => {
      formPayload.append('evidence', f);
    });

    const storedUser = localStorage.getItem('theft_protect_user');
    const token = storedUser ? JSON.parse(storedUser).token : null;

    try {
      const res = await axios.post(`${API_URL}/cases/${selectedCase._id}/evidence`, formPayload, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      if (res.data.success) {
        const updated = cases.map(c => c._id === selectedCase._id ? { ...c, evidence: res.data.data.evidence, timeline: res.data.data.timeline, updatedAt: new Date().toISOString() } : c);
        setCases(updated);
        setSelectedCase({ ...selectedCase, evidence: res.data.data.evidence, timeline: res.data.data.timeline, updatedAt: new Date().toISOString() });
        alert('Evidence files uploaded successfully.');
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to upload files.');
    } finally {
      setUploadingFiles(false);
    }
  };

  // Searching and Filtering
  const filteredCases = cases.filter(c => {
    const matchesSearch = c.caseId.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.theftType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.citizen.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter !== 'All') {
      if (statusFilter === 'Assigned') {
        matchesStatus = c.status === 'Assigned' && c.assignedOfficer?._id === user._id;
      } else if (statusFilter === 'Unassigned') {
        matchesStatus = !c.assignedOfficer;
      } else {
        matchesStatus = c.status === statusFilter;
      }
    }
    return matchesSearch && matchesStatus;
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'text-safety-crimson border-safety-crimson/30 bg-safety-crimson/10';
      case 'Medium': return 'text-safety-amber border-safety-amber/30 bg-safety-amber/10';
      case 'Low':
      default:
        return 'text-navy-light border-navy-light/35 bg-navy-light/10';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
      
      {/* Header Summary */}
      <div className="pb-4 border-b border-navy-border/60 mb-6 shrink-0 flex justify-between items-center">
        <div>
          <span className="text-[10px] font-mono text-navy-light font-bold tracking-widest uppercase">PRECINCT INCIDENT MANAGEMENT CONSOLE</span>
          <h1 className="text-xl font-bold font-sans mt-0.5">Welcome, Officer {user.name}</h1>
          <p className="text-[11px] text-slate-light">{user.department} // Badge ID: {user.badgeNumber}</p>
        </div>
      </div>

      {/* Main console content */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0 overflow-hidden">
        
        {/* Left Pane - Cases List */}
        <div className="lg:w-1/3 flex flex-col space-y-4 shrink-0 bg-navy-medium/20 rounded-xl border border-navy-border p-4 min-h-[300px] lg:min-h-0 overflow-y-auto">
          
          <div className="space-y-2.5 shrink-0 font-sans">
            <h2 className="text-sm font-bold font-sans uppercase font-mono tracking-wider text-slate-200">Incident Registry Queue</h2>
            
            {/* Search */}
            <div className="relative font-sans">
              <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-gray">
                <Search className="h-3.5 w-3.5" />
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search case, citizen, type..."
                className="w-full pl-8 pr-3 py-1.5 rounded bg-navy-dark border border-navy-border text-xs text-white focus:outline-none focus:border-navy-light font-sans"
              />
            </div>

            {/* Filter Dropdown */}
            <div className="flex items-center space-x-2">
              <Filter className="h-3.5 w-3.5 text-slate-light" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex-1 py-1 px-2 rounded bg-navy-dark border border-navy-border text-xs font-semibold text-slate-light"
              >
                <option value="All">All Incidents</option>
                <option value="Unassigned">Unassigned (Alert!)</option>
                <option value="Assigned">Assigned To Me</option>
                <option value="Reported">Reported</option>
                <option value="Investigating">Investigating</option>
                <option value="Evidence Verification">Evidence Verification</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>

          {/* List queue */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {loading ? (
              <div className="text-center py-12 text-xs font-mono text-slate-light animate-pulse">
                PARSING INCIDENT LOGS...
              </div>
            ) : filteredCases.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-gray font-mono italic">
                NO CASE RECORDS MATCH SELECTION.
              </div>
            ) : (
              filteredCases.map((c) => (
                <div
                  key={c._id}
                  onClick={() => selectCaseFile(c)}
                  className={`p-3 rounded-lg border text-left cursor-pointer transition ${
                    selectedCase?._id === c._id
                      ? 'bg-navy-light/10 border-navy-light'
                      : 'bg-navy-dark/40 border-navy-border/50 hover:bg-navy-light/5'
                  }`}
                >
                  <div className="flex justify-between items-center text-[10px] font-mono mb-1.5">
                    <span className="font-bold text-slate-300">{c.caseId}</span>
                    <span className={`px-1.5 py-0.2 rounded font-bold capitalize ${
                      c.status === 'Resolved' ? 'text-safety-emerald bg-safety-emerald/15' :
                      (c.status === 'Investigating' || c.status === 'Evidence Verification') ? 'text-safety-amber bg-safety-amber/15' :
                      'text-safety-crimson bg-safety-crimson/15'
                    }`}>{c.status}</span>
                  </div>

                  <h4 className="text-xs font-bold text-white truncate">{c.theftType}</h4>
                  <p className="text-[10px] text-slate-light truncate">{c.location.address}</p>

                  <div className="flex justify-between items-center text-[9px] text-slate-gray mt-2 pt-1.5 border-t border-navy-border/30">
                    <span className="font-sans">Citizen: {c.citizen.name}</span>
                    <span className="font-mono">{new Date(c.incidentDate).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>

        {/* Right Pane - Case Dossier Detail View */}
        <div className="flex-1 bg-navy-medium/20 rounded-xl border border-navy-border p-4 md:p-6 overflow-y-auto min-h-0 flex flex-col space-y-6">
          
          {selectedCase ? (
            <div className="space-y-6">
              
              {/* Dossier Header Info */}
              <div className="border-b border-navy-border pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center space-x-2 text-[10px] font-mono">
                    <span className="text-slate-light">INCIDENT DOSSIER ID:</span>
                    <span className="text-white font-bold">{selectedCase.caseId}</span>
                    <span className={`px-1.5 border rounded uppercase font-bold text-[8px] ${getPriorityColor(selectedCase.priority)}`}>
                      {selectedCase.priority} PRIORITY
                    </span>
                  </div>
                  <h2 className="text-lg font-bold font-sans text-white mt-1">{selectedCase.theftType}</h2>
                  <p className="text-xs text-slate-light mt-0.5 flex items-center">
                    <MapPin className="h-3.5 w-3.5 text-navy-light mr-1 shrink-0" />
                    <span>{selectedCase.location.address}</span>
                  </p>
                </div>

                <div className="flex items-center space-x-3 self-stretch sm:self-auto justify-end">
                  <button
                    onClick={() => generateFIRReportPDF(selectedCase)}
                    className="px-3 py-1.5 bg-navy-medium border border-navy-border hover:bg-navy-light/10 hover:text-navy-light text-[10px] font-mono font-semibold rounded text-slate-200 transition flex items-center space-x-1.5"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>DOWNLOAD FIR DOCK</span>
                  </button>
                </div>
              </div>

              {actionError && (
                <div className="p-3 bg-safety-crimson/10 border border-safety-crimson/30 rounded-lg text-xs text-safety-crimson font-mono flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>{actionError}</span>
                </div>
              )}

              {/* Grid 2 Column */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Dossier Core specs */}
                <div className="lg:col-span-2 space-y-5">
                  
                  {/* Map Pin plot */}
                  <div className="bg-navy-dark/40 border border-navy-border rounded-xl p-3">
                    <span className="text-[9px] font-mono text-slate-light uppercase block mb-1.5">SCENE GEOGRAPHIC PINPOINT</span>
                    <DashboardMap cases={[selectedCase]} height="200px" />
                  </div>

                  {/* Narrative details */}
                  <div className="space-y-1 bg-navy-dark/30 border border-navy-border p-4 rounded-xl">
                    <span className="text-[9px] font-mono text-slate-gray uppercase">STATUTORY COMPLAINT STATEMENT</span>
                    <p className="text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-wrap">{selectedCase.description}</p>
                    <div className="flex flex-wrap items-center gap-4 text-[10px] text-slate-gray pt-3 mt-3 border-t border-navy-border/40 font-mono">
                      <span>FILED BY: {selectedCase.citizen.name} ({selectedCase.citizen.phoneNumber})</span>
                      <span>•</span>
                      <span>INCIDENT TIMESTAMP: {new Date(selectedCase.incidentDate).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Evidence Viewer */}
                  <div className="space-y-3 bg-navy-dark/30 border border-navy-border p-4 rounded-xl">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-mono text-slate-gray uppercase">EXHIBIT EVIDENCE GALLERY</span>
                      
                      <label className="flex items-center space-x-1 px-2.5 py-1 bg-navy-light hover:bg-[#C5933E] text-[9px] font-mono font-bold rounded cursor-pointer transition border border-navy-border text-black">
                        <FilePlus className="h-3 w-3" />
                        <span>{uploadingFiles ? 'UPLOADING...' : 'ADD ATTACHMENTS'}</span>
                        <input
                          type="file"
                          multiple
                          onChange={handleExtraFilesUpload}
                          disabled={uploadingFiles}
                          className="hidden"
                          accept="image/*,video/*,application/pdf"
                        />
                      </label>
                    </div>
                    <EvidenceGallery evidence={selectedCase.evidence} />
                  </div>

                </div>

                {/* Operations Panel (Status update, Note addition) */}
                <div className="space-y-5">
                  
                  {/* Status update form */}
                  <div className="bg-navy-dark/30 border border-navy-border p-4 rounded-xl space-y-3">
                    <span className="text-[9px] font-mono text-safety-amber font-bold block border-b border-navy-border/50 pb-1.5">INVESTIGATION CASE STATE</span>
                    
                    <form onSubmit={handleStatusSubmit} className="space-y-3.5">
                      <div>
                        <label className="block text-[9px] font-mono text-slate-light mb-1">DOSSIER STATUS</label>
                        <select
                          value={statusUpdate}
                          onChange={(e) => setStatusUpdate(e.target.value)}
                          className="w-full py-1.5 px-2 rounded bg-navy-dark border border-navy-border text-xs text-white focus:outline-none focus:border-navy-light font-sans"
                        >
                          <option value="Reported">Reported</option>
                          <option value="Assigned">Assigned</option>
                          <option value="Investigating">Investigating</option>
                          <option value="Evidence Verification">Evidence Verification</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[9px] font-mono text-slate-light mb-1">TIMELINE UPDATE NOTE</label>
                        <textarea
                          value={statusNote}
                          onChange={(e) => setStatusNote(e.target.value)}
                          rows="2"
                          placeholder="e.g. Canvassing area cameras."
                          className="w-full py-1.5 px-2.5 rounded bg-navy-dark border border-navy-border text-xs text-white leading-relaxed focus:outline-none focus:border-navy-light font-sans"
                        ></textarea>
                      </div>

                      <button
                        type="submit"
                        disabled={updating}
                        className="w-full py-2 bg-navy-light hover:bg-[#C5933E] text-[10px] font-bold text-black rounded transition shadow"
                      >
                        {updating ? 'DISPATCHING REVISIONS...' : 'UPDATE SYSTEM STATUS'}
                      </button>
                    </form>
                  </div>

                  {/* Add note form */}
                  <div className="bg-navy-dark/30 border border-navy-border p-4 rounded-xl space-y-3 font-sans">
                    <span className="text-[9px] font-mono text-slate-light font-bold block border-b border-navy-border/50 pb-1.5">INTERNAL DOSSIER NOTEBOOK</span>
                    
                    <form onSubmit={handleAddNote} className="space-y-3">
                      <div>
                        <textarea
                          value={noteInput}
                          onChange={(e) => setNoteInput(e.target.value)}
                          rows="3"
                          placeholder="Write private investigator notes..."
                          className="w-full py-1.5 px-2 rounded bg-navy-dark border border-navy-border text-xs text-white leading-relaxed focus:outline-none font-sans"
                          required
                        ></textarea>
                      </div>

                      <button
                        type="submit"
                        disabled={updating}
                        className="w-full py-2 bg-navy-medium hover:bg-navy-light hover:text-black text-[10px] font-bold text-white rounded transition border border-navy-border"
                      >
                        {updating ? 'LOGGING NOTE...' : 'LOG INTERNAL NOTE'}
                      </button>
                    </form>

                    {/* Quick logs list */}
                    <div className="pt-3 border-t border-navy-border/30 max-h-[160px] overflow-y-auto space-y-2">
                      <span className="text-[9px] font-mono text-slate-gray uppercase block">Log entries ({selectedCase.officerNotes.length})</span>
                      {selectedCase.officerNotes.map((n, idx) => (
                        <div key={idx} className="p-2 rounded bg-navy-dark/50 border border-navy-border/40 text-[10px] leading-relaxed">
                          <p className="text-slate-300 font-sans">{n.note}</p>
                          <span className="block text-[8px] text-slate-gray mt-1 font-mono">{n.addedBy} - {new Date(n.createdAt).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>

            </div>
          ) : (
            <div className="flex-grow flex items-center justify-center text-slate-gray text-xs font-mono py-20 italic">
              NO dossiers registered.
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default OfficerDashboard;
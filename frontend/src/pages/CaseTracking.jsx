import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';
import { generateFIRReportPDF } from '../utils/pdfGenerator';
import { motion } from 'framer-motion';
import { Shield, Search, ArrowLeft, Download, User, Calendar, MapPin, ClipboardList, Clock } from 'lucide-react';
import EvidenceGallery from '../components/EvidenceGallery';

const CaseTracking = () => {
  const { caseId } = useParams(); // For /citizen/track/:caseId
  const [searchParams] = useSearchParams(); // For /track-case?id=THF-YYYY-XXX
  const queryId = searchParams.get('id');

  const [inputCaseId, setInputCaseId] = useState('');
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const activeCaseId = caseId || queryId || '';

  useEffect(() => {
    if (activeCaseId) {
      fetchCaseDetails(activeCaseId);
    }
  }, [activeCaseId]);

  const fetchCaseDetails = async (idToSearch) => {
    setLoading(true);
    setError('');
    setCaseData(null);
    try {
      const res = await axios.get(`${API_URL}/cases/${idToSearch}`);
      if (res.data.success) {
        setCaseData(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Case not found. Please verify the Case ID format (e.g. THF-2026-001).');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!inputCaseId.trim()) return;
    fetchCaseDetails(inputCaseId.trim());
  };

  // Timeline Step calculation
  const timelineMilestones = [
    { label: 'Reported', desc: 'Case received and registered online' },
    { label: 'Assigned', desc: 'Precinct investigator assigned' },
    { label: 'Investigating', desc: 'Investigation initiated' },
    { label: 'Evidence Verification', desc: 'Evidence gallery review' },
    { label: 'Resolved', desc: 'Case resolved and locked' }
  ];

  const getMilestoneIndex = (status) => {
    return timelineMilestones.findIndex(m => m.label === status);
  };

  const getStatusStyle = (idx, currentStatus) => {
    const currentIndex = getMilestoneIndex(currentStatus);
    if (idx < currentIndex) {
      return { line: 'bg-safety-emerald', dot: 'bg-safety-emerald border-safety-emerald text-white', label: 'text-safety-emerald' };
    }
    if (idx === currentIndex) {
      if (currentStatus === 'Resolved') {
        return { line: 'bg-safety-emerald', dot: 'bg-safety-emerald border-safety-emerald text-white', label: 'text-safety-emerald' };
      }
      return { line: 'bg-safety-amber', dot: 'bg-safety-amber border-safety-amber text-white animate-pulse', label: 'text-safety-amber' };
    }
    return { line: 'bg-navy-border', dot: 'bg-navy-dark border-navy-border text-slate-gray', label: 'text-slate-gray' };
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 flex-grow">
      
      {/* Return Navigation */}
      <div className="mb-6 flex justify-between items-center">
        <Link to="/" className="inline-flex items-center space-x-1.5 text-xs text-slate-light hover:text-white transition font-mono">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>RETURN TO HOME COMMAND</span>
        </Link>
        {caseData && (
          <button
            onClick={() => generateFIRReportPDF(caseData)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-navy-light hover:bg-[#C5933E] text-[10px] font-bold rounded text-black transition border border-navy-border font-mono shadow"
          >
            <Download className="h-3.5 w-3.5" />
            <span>DOWNLOAD FIR REPORT</span>
          </button>
        )}
      </div>

      {/* Lookup view if no active Case ID is queried */}
      {!activeCaseId && !caseData && (
        <div className="max-w-md mx-auto glass-card p-6 rounded-2xl shadow-glass border border-navy-border/60 text-center space-y-6">
          <div className="mx-auto h-12 w-12 bg-navy-light/10 border border-navy-light/35 rounded-full flex items-center justify-center text-navy-light">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-sans">Public Case Tracker</h1>
            <p className="text-xs text-slate-light mt-1">Input Case reference ID to review case status timeline.</p>
          </div>

          <form onSubmit={handleSearchSubmit} className="space-y-4">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-gray">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={inputCaseId}
                onChange={(e) => setInputCaseId(e.target.value)}
                placeholder="THF-YYYY-XXX"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm glass-input font-mono text-center tracking-wider"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-safety-crimson hover:bg-red-600 text-xs font-semibold rounded-lg text-white transition duration-200"
            >
              {loading ? 'RETRIEVING FILE RECORDS...' : 'SEARCH CASE RECORDS'}
            </button>
          </form>

          {error && (
            <p className="text-xs text-safety-crimson font-mono bg-safety-crimson/10 border border-safety-crimson/30 p-2.5 rounded-lg">{error}</p>
          )}
        </div>
      )}

      {/* Case Details Dashboard view */}
      {loading && (
        <div className="glass-card p-12 text-center text-xs font-mono text-slate-light animate-pulse">
          ACCESSING SYSTEM DOSSIER FILE FOR {activeCaseId}...
        </div>
      )}

      {error && activeCaseId && (
        <div className="glass-card p-8 text-center rounded-xl max-w-md mx-auto space-y-4">
          <Shield className="h-10 w-10 text-safety-crimson mx-auto" />
          <h4 className="font-semibold text-sm">Failed to Load Dossier</h4>
          <p className="text-xs text-slate-light">{error}</p>
          <button
            onClick={() => {
              // Clear URL search params
              window.location.search = '';
            }}
            className="px-4 py-2 bg-navy-light text-white text-xs font-semibold rounded"
          >
            Try Another Search
          </button>
        </div>
      )}

      {caseData && !loading && (
        <div className="space-y-6">
          
          {/* Main info card */}
          <div className="glass-card p-5 rounded-2xl border border-navy-border shadow-glass">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-navy-border/50 gap-2 mb-4">
              <div>
                <span className="text-[9px] font-mono text-slate-light">THEFT PROTECTION INCIDENT DOSSIER</span>
                <div className="flex items-center space-x-2 mt-1">
                  <h1 className="text-lg font-bold font-sans">{caseData.caseId}</h1>
                  <span className={`text-[9px] px-2 py-0.5 rounded font-bold capitalize ${
                    caseData.status === 'Resolved' ? 'bg-safety-emerald/15 text-safety-emerald border border-safety-emerald/30' :
                    (caseData.status === 'Investigating' || caseData.status === 'Evidence Verification') ? 'bg-safety-amber/15 text-safety-amber border border-safety-amber/30' :
                    'bg-safety-crimson/15 text-safety-crimson border border-safety-crimson/30'
                  }`}>{caseData.status}</span>
                </div>
              </div>
              <div className="text-[10px] text-slate-light font-mono text-left sm:text-right">
                <span className="block">LAST UPDATED:</span>
                <span className="text-white">{new Date(caseData.updatedAt || caseData.createdAt).toLocaleString()}</span>
              </div>
            </div>

            {/* Core facts grids */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1 bg-navy-dark/40 p-3 rounded-lg border border-navy-border/40">
                <span className="text-[9px] font-mono text-slate-light uppercase">THEFT CLASSIFICATION</span>
                <p className="font-semibold text-slate-200">{caseData.theftType}</p>
                <div className="flex items-center text-[10px] text-slate-gray mt-1">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>{new Date(caseData.incidentDate).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="space-y-1 bg-navy-dark/40 p-3 rounded-lg border border-navy-border/40 md:col-span-2">
                <span className="text-[9px] font-mono text-slate-light uppercase">RESOLVED GEOGRAPHY</span>
                <p className="font-semibold text-slate-200 truncate" title={caseData.location.address}>{caseData.location.address}</p>
                <div className="flex items-center text-[10px] text-slate-gray mt-1">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span>Coordinates: Lat {caseData.location.coordinates[1].toFixed(5)}, Lng {caseData.location.coordinates[0].toFixed(5)}</span>
                </div>
              </div>
            </div>

            {/* Complainant & Officer details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-navy-border/40 text-xs">
              <div>
                <span className="text-[9px] font-mono text-slate-gray uppercase block mb-1">COMPLAINANT IDENTITY</span>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-navy-light flex items-center justify-center border border-navy-border">
                    <User className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-200">{caseData.citizen.name}</p>
                    <p className="text-[10px] text-slate-gray font-mono">{caseData.citizen.email} // {caseData.citizen.phoneNumber}</p>
                  </div>
                </div>
              </div>

              <div>
                <span className="text-[9px] font-mono text-slate-gray uppercase block mb-1">ASSIGNED POLICE INVESTIGATOR</span>
                {caseData.assignedOfficer && caseData.assignedOfficer.name ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-navy-medium flex items-center justify-center border border-navy-border">
                      <Shield className="h-3 w-3 text-navy-light" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-200">Officer {caseData.assignedOfficer.name}</p>
                      <p className="text-[10px] text-slate-gray font-mono">BADGE: {caseData.assignedOfficer.badgeNumber} // PH: {caseData.assignedOfficer.phoneNumber || '911'}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-light italic font-mono text-[10px] pt-1">Officer Assignment Pending (Incident in queue).</p>
                )}
              </div>
            </div>

            {/* Statement narrative */}
            <div className="mt-4 pt-4 border-t border-navy-border/40 text-xs">
              <span className="text-[9px] font-mono text-slate-gray uppercase block mb-1.5">STATUTORY NARRATIVE STATEMENT</span>
              <p className="text-slate-300 leading-relaxed font-sans whitespace-pre-wrap">{caseData.description}</p>
            </div>
          </div>

          {/* Timeline and notes grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Visual Timeline progress */}
            <div className="lg:col-span-2 glass-card p-5 rounded-2xl border border-navy-border shadow-glass">
              <h2 className="text-sm font-bold font-sans tracking-tight mb-6 flex items-center">
                <Clock className="h-4 w-4 text-safety-amber mr-1.5" /> Case Progress Milestones
              </h2>

              <div className="relative pl-6 space-y-6 border-l border-navy-border timeline-dash">
                {timelineMilestones.map((milestone, idx) => {
                  const style = getStatusStyle(idx, caseData.status);
                  const isCurrent = getMilestoneIndex(caseData.status) === idx;

                  return (
                    <div key={idx} className="relative">
                      {/* Timeline dot blip */}
                      <span className={`absolute -left-[30px] top-0.5 w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center text-[8px] font-bold ${style.dot}`}>
                        {idx + 1}
                      </span>
                      
                      <div className="leading-tight">
                        <h4 className={`text-xs font-bold ${style.label} flex items-center`}>
                          {milestone.label.toUpperCase()}
                          {isCurrent && <span className="ml-2 px-1.5 py-0.2 rounded bg-navy-light text-[8px] font-mono font-bold tracking-wider animate-pulse">ACTIVE</span>}
                        </h4>
                        <p className="text-[11px] text-slate-light mt-1">{milestone.desc}</p>
                        
                        {/* If matching history, show date */}
                        {caseData.timeline.find(t => t.status === milestone.label) && (
                          <span className="text-[9px] text-slate-gray font-mono block mt-1">
                            LOCKED: {new Date(caseData.timeline.find(t => t.status === milestone.label).timestamp).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Officer Notes feed */}
            <div className="glass-card p-5 rounded-2xl border border-navy-border shadow-glass flex flex-col justify-between">
              <div>
                <h2 className="text-sm font-bold font-sans tracking-tight mb-4 flex items-center">
                  <ClipboardList className="h-4 w-4 text-safety-crimson mr-1.5" /> Investigator Notes
                </h2>

                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                  {caseData.officerNotes.length === 0 ? (
                    <div className="text-center py-8 text-[10px] text-slate-gray font-mono italic leading-normal border border-dashed border-navy-border/50 rounded-lg p-3">
                      No notes have been logged by investigators on this file yet.
                    </div>
                  ) : (
                    caseData.officerNotes.map((note, index) => (
                      <div key={index} className="p-2.5 rounded bg-navy-dark/40 border border-navy-border/50 text-[11px] leading-relaxed">
                        <p className="text-slate-300 font-sans">{note.note}</p>
                        <div className="flex justify-between items-center text-[9px] text-slate-gray font-mono mt-1.5 border-t border-navy-border/30 pt-1">
                          <span>{note.addedBy}</span>
                          <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Evidence Grid */}
          <div className="glass-card p-5 rounded-2xl border border-navy-border shadow-glass">
            <h2 className="text-sm font-bold font-sans tracking-tight mb-4">Case File Evidence Files</h2>
            <EvidenceGallery evidence={caseData.evidence} />
          </div>

        </div>
      )}

    </div>
  );
};

export default CaseTracking;
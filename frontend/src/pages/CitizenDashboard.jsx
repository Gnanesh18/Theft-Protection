import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { generateFIRReportPDF } from '../utils/pdfGenerator';
import { motion } from 'framer-motion';
import { PlusCircle, FileText, Clock, CheckCircle2, Eye, Download, Info, AlertTriangle } from 'lucide-react';

const CitizenDashboard = () => {
  const { user, notifications } = useAuth();
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    total: 0,
    investigating: 0,
    resolved: 0
  });

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/cases');
        if (res.data.success) {
          const fetchedCases = res.data.data;
          setCases(fetchedCases);
          
          // Calculate metrics
          const total = fetchedCases.length;
          const investigating = fetchedCases.filter(c => c.status !== 'Resolved').length;
          const resolved = fetchedCases.filter(c => c.status === 'Resolved').length;
          setMetrics({ total, investigating, resolved });
        }
      } catch (err) {
        console.error('Error fetching citizen cases:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Resolved': return 'text-safety-emerald bg-safety-emerald/15 border border-safety-emerald/30';
      case 'Investigating': 
      case 'Evidence Verification': 
        return 'text-safety-amber bg-safety-amber/15 border border-safety-amber/30';
      case 'Reported':
      case 'Assigned':
      default:
        return 'text-safety-crimson bg-safety-crimson/15 border border-safety-crimson/30';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
      
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-navy-border/60 mb-6 gap-4">
        <div>
          <span className="text-[10px] font-mono text-safety-emerald font-bold tracking-widest uppercase">CITIZEN COMMUNIQUE PORTAL</span>
          <h1 className="text-2xl font-bold font-sans mt-1">Hello, {user.name}</h1>
          <p className="text-xs text-slate-light mt-0.5">Manage filed theft dossiers, upload evidence, and download certified FIR documents.</p>
        </div>
        <div>
          <Link
            to="/citizen/report"
            className="flex items-center space-x-1.5 px-4 py-2.5 bg-safety-crimson hover:bg-red-600 text-xs font-semibold rounded-lg text-white transition duration-200 shadow-[0_0_10px_rgba(239,68,68,0.2)]"
          >
            <PlusCircle className="h-4 w-4" />
            <span>REPORT NEW THEFT</span>
          </Link>
        </div>
      </div>

      {/* Grid Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-card p-5 rounded-xl border-l-4 border-l-blue-400 flex items-center justify-between shadow-glass">
          <div>
            <p className="text-[9px] font-mono text-slate-light tracking-wider uppercase">SUBMITTED REPORTS</p>
            <h3 className="text-2xl font-bold font-sans mt-1.5">{metrics.total}</h3>
          </div>
          <div className="p-2.5 bg-blue-500/10 rounded-lg text-blue-400"><FileText className="h-5 w-5" /></div>
        </div>

        <div className="glass-card p-5 rounded-xl border-l-4 border-l-safety-amber flex items-center justify-between shadow-glass">
          <div>
            <p className="text-[9px] font-mono text-slate-light tracking-wider uppercase">UNDER INVESTIGATION</p>
            <h3 className="text-2xl font-bold font-sans text-safety-amber mt-1.5">{metrics.investigating}</h3>
          </div>
          <div className="p-2.5 bg-safety-amber/10 rounded-lg text-safety-amber"><Clock className="h-5 w-5 animate-spin" style={{ animationDuration: '6s' }} /></div>
        </div>

        <div className="glass-card p-5 rounded-xl border-l-4 border-l-safety-emerald flex items-center justify-between shadow-glass">
          <div>
            <p className="text-[9px] font-mono text-slate-light tracking-wider uppercase">RESOLVED / CLOSED</p>
            <h3 className="text-2xl font-bold font-sans text-safety-emerald mt-1.5">{metrics.resolved}</h3>
          </div>
          <div className="p-2.5 bg-safety-emerald/10 rounded-lg text-safety-emerald"><CheckCircle2 className="h-5 w-5" /></div>
        </div>
      </div>

      {/* Main Content splits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Cases List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-base font-bold font-sans tracking-tight">Active & Previous Reports</h2>
            <span className="text-[9px] font-mono text-slate-light">TOTAL RECORDS: {cases.length}</span>
          </div>

          {loading ? (
            <div className="glass-card p-12 text-center text-xs font-mono text-slate-light animate-pulse">
              LOADING REPORT FILE ARCHIVES...
            </div>
          ) : cases.length === 0 ? (
            <div className="glass-card p-8 text-center rounded-xl">
              <AlertTriangle className="h-8 w-8 text-safety-amber mx-auto mb-2" />
              <h4 className="font-semibold text-sm">No Incidents Found</h4>
              <p className="text-xs text-slate-light mt-1.5 max-w-sm mx-auto leading-relaxed">
                You have not registered any theft incidents. If you need to report a theft, click the button above to begin filing.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {cases.map((c) => (
                <motion.div
                  key={c._id}
                  layoutId={c._id}
                  className="glass-card p-4 rounded-xl border border-navy-border flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card-hover"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-300">{c.caseId}</span>
                      <span className={`text-[9px] px-2 py-0.5 rounded font-bold capitalize ${getStatusColor(c.status)}`}>
                        {c.status}
                      </span>
                      <span className="text-[10px] font-mono text-[#A855F7] px-1.5 py-0.2 rounded bg-purple-500/10 border border-purple-500/20 font-bold uppercase">
                        {c.priority} Priority
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-white">{c.theftType}</h3>
                    <p className="text-xs text-slate-light line-clamp-1 pr-6">{c.description}</p>
                    
                    <div className="flex items-center space-x-4 text-[10px] text-slate-gray pt-1 font-mono">
                      <span>DATE: {new Date(c.incidentDate).toLocaleDateString()}</span>
                      <span>•</span>
                      <span className="truncate max-w-[200px] md:max-w-[300px]" title={c.location.address}>
                        LOC: {c.location.address}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-row md:flex-col items-center justify-end gap-2 shrink-0 border-t border-navy-border/40 pt-3.5 md:border-t-0 md:pt-0">
                    <button
                      onClick={() => navigate(`/citizen/track/${c.caseId}`)}
                      className="flex-1 md:w-32 py-1.5 bg-navy-light hover:bg-[#C5933E] text-[10px] font-bold rounded text-black flex items-center justify-center space-x-1 transition"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>TRACK INCIDENT</span>
                    </button>
                    <button
                      onClick={() => generateFIRReportPDF(c)}
                      className="flex-grow-0 py-1.5 px-3 bg-navy-medium hover:bg-navy-light/10 hover:text-navy-light border border-navy-border rounded text-[10px] font-semibold text-slate-300 flex items-center justify-center space-x-1.5 transition"
                      title="Download Certified FIR PDF"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span className="md:hidden">DOWNLOAD FIR</span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Real-time Alerts / Notifications */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-bold font-sans tracking-tight">Precinct Activity Alerts</h2>
          </div>

          <div className="glass-card p-4 rounded-xl border border-navy-border/60 max-h-[400px] overflow-y-auto divide-y divide-navy-border">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-light font-mono flex flex-col items-center justify-center">
                <Info className="h-6 w-6 text-slate-gray mb-1.5" />
                <span>NO RECENT ACTIVITY ALERTS FOUND.</span>
              </div>
            ) : (
              notifications.map((notif, index) => (
                <div key={notif._id || index} className={`py-3 text-xs transition duration-150 ${notif.isRead ? 'opacity-85' : 'font-semibold text-white'}`}>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-safety-crimson"></span>
                    <p className="text-slate-200">{notif.title}</p>
                  </div>
                  <p className="text-slate-light mt-1 text-[11px] leading-relaxed font-sans">{notif.message}</p>
                  <span className="text-[9px] text-[#64748B] block mt-1 font-mono">
                    {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} // {new Date(notif.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default CitizenDashboard;
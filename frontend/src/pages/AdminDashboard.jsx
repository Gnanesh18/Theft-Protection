import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { Shield, Users, FolderOpen, PieChart, Activity, CheckSquare, Award, Power, RefreshCw, Check, X, Eye, Trash2, ChevronDown, ChevronUp, ClipboardList, Calendar } from 'lucide-react';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('analytics'); // analytics, cases, users
  const [analyticsData, setAnalyticsData] = useState(null);
  const [cases, setCases] = useState([]);
  const [users, setUsers] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIdImage, setSelectedIdImage] = useState(null);
  const [expandedCitizenId, setExpandedCitizenId] = useState(null);

  // Re-fetch helper
  useEffect(() => {
    fetchAdminData();
  }, [activeTab]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'analytics') {
        const res = await axios.get(`${API_URL}/analytics`);
        if (res.data.success) {
          setAnalyticsData(res.data.data);
        }
      } else if (activeTab === 'cases') {
        const casesRes = await axios.get(`${API_URL}/cases`);
        const officersRes = await axios.get(`${API_URL}/users/officers`);
        if (casesRes.data.success) setCases(casesRes.data.data);
        if (officersRes.data.success) setOfficers(officersRes.data.data);
      } else if (activeTab === 'users') {
        const usersRes = await axios.get(`${API_URL}/users`);
        const casesRes = await axios.get(`${API_URL}/cases`);
        if (usersRes.data.success) {
          setUsers(usersRes.data.data);
        }
        if (casesRes.data.success) {
          setCases(casesRes.data.data);
        }
      } else if (activeTab === 'logs') {
        const token = localStorage.getItem('theft_protect_token') || user?.token;
        const res = await axios.get(`${API_URL}/users/admin/logs`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          setLogs(res.data.data);
        }
      }
    } catch (err) {
      console.error('Error fetching admin data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      const res = await axios.put(`${API_URL}/users/${userId}/status`, {
        isActive: !currentStatus
      });
      if (res.data.success) {
        setUsers(users.map(u => u._id === userId ? { ...u, isActive: !currentStatus } : u));
        alert('User account status updated.');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle status.');
    }
  };

  const handleRejectOfficer = async (userId) => {
    if (!window.confirm('Are you sure you want to reject and delete this officer registration?')) return;
    try {
      const res = await axios.delete(`${API_URL}/users/${userId}`);
      if (res.data.success) {
        setUsers(users.filter(u => u._id !== userId));
        alert('Officer registration rejected and profile deleted.');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject officer.');
    }
  };

  const handleAssignOfficer = async (caseId, officerId) => {
    if (!officerId) return;
    try {
      const res = await axios.put(`${API_URL}/cases/${caseId}/assign`, {
        officerId
      });
      if (res.data.success) {
        const assignedOfficer = officers.find(o => o._id === officerId);
        setCases(cases.map(c => c._id === caseId ? {
          ...c,
          assignedOfficer: {
            _id: assignedOfficer._id,
            name: assignedOfficer.name,
            badgeNumber: assignedOfficer.badgeNumber
          },
          status: c.status === 'Reported' ? 'Assigned' : c.status
        } : c));
        alert('Investigating officer assigned successfully.');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign officer.');
    }
  };

  // Setup charts datasets
  const getLineChartData = () => {
    if (!analyticsData) return { labels: [], datasets: [] };
    const labels = Object.keys(analyticsData.monthlyTrends);
    const data = Object.values(analyticsData.monthlyTrends);

    return {
      labels,
      datasets: [
        {
          label: 'Monthly Theft Reports',
          data,
          fill: true,
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderColor: '#EF4444',
          borderWidth: 2,
          tension: 0.35,
          pointBackgroundColor: '#EF4444',
        }
      ]
    };
  };

  const getDoughnutChartData = () => {
    if (!analyticsData) return { labels: [], datasets: [] };
    const labels = Object.keys(analyticsData.theftTypeDistribution);
    const data = Object.values(analyticsData.theftTypeDistribution);

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: [
            '#D9A752', // Gold
            '#EF4444', // Crimson
            '#F59E0B', // Amber
            '#C5A880', // Bronze Gold
            '#2A2A2F'  // Charcoal
          ],
          borderColor: '#141416',
          borderWidth: 1,
        }
      ]
    };
  };

  const getBarChartData = () => {
    if (!analyticsData) return { labels: [], datasets: [] };
    const labels = Object.keys(analyticsData.statusDistribution);
    const data = Object.values(analyticsData.statusDistribution);

    return {
      labels,
      datasets: [
        {
          label: 'Incidents Count',
          data,
          backgroundColor: [
            'rgba(239, 68, 68, 0.75)', // Reported
            'rgba(245, 158, 11, 0.75)',  // Assigned
            'rgba(59, 130, 246, 0.75)',  // Investigating
            'rgba(168, 85, 247, 0.75)',  // Evidence Verification
            'rgba(16, 185, 129, 0.75)'   // Resolved
          ],
          borderWidth: 0,
          borderRadius: 4
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#94A3B8', font: { family: 'Inter', size: 10 } }
      }
    },
    scales: {
      x: { grid: { color: 'rgba(44, 79, 114, 0.15)' }, ticks: { color: '#94A3B8' } },
      y: { grid: { color: 'rgba(44, 79, 114, 0.15)' }, ticks: { color: '#94A3B8', stepSize: 1 } }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-navy-border/60 mb-6 gap-4 font-sans">
        <div>
          <span className="text-[10px] font-mono text-safety-crimson font-bold tracking-widest uppercase">ADMINISTRATIVE COMMAND TERMINAL</span>
          <h1 className="text-2xl font-bold font-sans mt-1">Command Control Room</h1>
          <p className="text-xs text-slate-light mt-0.5">Centralized supervision of precinct officers, files, and geospacial crime metrics.</p>
        </div>
        <button
          onClick={fetchAdminData}
          className="flex items-center space-x-1 px-3 py-2 bg-navy-light/60 hover:bg-navy-light text-xs font-semibold rounded text-white transition border border-navy-border font-mono"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>RELOAD REGISTRY</span>
        </button>
      </div>

      {/* Tabs Row */}
      <div className="flex border-b border-navy-border/60 mb-8 font-sans text-sm font-semibold">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-5 py-2.5 border-b-2 transition flex items-center space-x-1.5 ${
            activeTab === 'analytics'
              ? 'border-safety-crimson text-white bg-navy-light/10'
              : 'border-transparent text-slate-light hover:text-white'
          }`}
        >
          <PieChart className="h-4 w-4" />
          <span>SYSTEM ANALYTICS</span>
        </button>
        <button
          onClick={() => setActiveTab('cases')}
          className={`px-5 py-2.5 border-b-2 transition flex items-center space-x-1.5 ${
            activeTab === 'cases'
              ? 'border-safety-crimson text-white bg-navy-light/10'
              : 'border-transparent text-slate-light hover:text-white'
          }`}
        >
          <FolderOpen className="h-4 w-4" />
          <span>CASE MANAGER</span>
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-5 py-2.5 border-b-2 transition flex items-center space-x-1.5 ${
            activeTab === 'users'
              ? 'border-safety-crimson text-white bg-navy-light/10'
              : 'border-transparent text-slate-light hover:text-white'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>USER DIRECTORY</span>
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-5 py-2.5 border-b-2 transition flex items-center space-x-1.5 ${
            activeTab === 'logs'
              ? 'border-safety-crimson text-white bg-navy-light/10'
              : 'border-transparent text-slate-light hover:text-white'
          }`}
        >
          <Activity className="h-4 w-4" />
          <span>SYSTEM AUDIT LOGS</span>
        </button>
      </div>

      {/* Dynamic Content Pane */}
      {loading ? (
        <div className="glass-card p-16 text-center text-xs font-mono text-slate-light animate-pulse">
          COMPILES CENTRAL FILE SYSTEM SCHEMAS...
        </div>
      ) : (
        <div>
          {/* ANALYTICS TAB VIEW */}
          {activeTab === 'analytics' && analyticsData && (
            <div className="space-y-8">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="glass-card p-4 rounded-xl shadow-glass">
                  <span className="text-[8px] font-mono text-slate-light uppercase">TOTAL FILES</span>
                  <h3 className="text-xl font-bold font-sans text-slate-200 mt-1">{analyticsData.summary.totalIncidents}</h3>
                </div>
                <div className="glass-card p-4 rounded-xl shadow-glass border-l-2 border-l-safety-emerald">
                  <span className="text-[8px] font-mono text-slate-light uppercase">RESOLVED CLOSED</span>
                  <h3 className="text-xl font-bold font-sans text-safety-emerald mt-1">{analyticsData.summary.resolvedCases}</h3>
                </div>
                <div className="glass-card p-4 rounded-xl shadow-glass border-l-2 border-l-safety-crimson">
                  <span className="text-[8px] font-mono text-slate-light uppercase">PENDING QUEUE</span>
                  <h3 className="text-xl font-bold font-sans text-safety-crimson mt-1">{analyticsData.summary.pendingCases}</h3>
                </div>
                <div className="glass-card p-4 rounded-xl shadow-glass border-l-2 border-l-safety-amber">
                  <span className="text-[8px] font-mono text-slate-light uppercase">ACTIVE OFFICERS</span>
                  <h3 className="text-xl font-bold font-sans text-safety-amber mt-1">{analyticsData.summary.activeOfficers}</h3>
                </div>
                <div className="glass-card p-4 rounded-xl shadow-glass col-span-2 lg:col-span-1 bg-[#10B981]/5 border-l-2 border-l-safety-emerald">
                  <span className="text-[8px] font-mono text-slate-light uppercase">RESOLUTION RATE</span>
                  <h3 className="text-xl font-bold font-sans text-safety-emerald mt-1">{analyticsData.summary.resolutionRate}%</h3>
                </div>
              </div>

              {/* Chart grids */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Monthly Trends */}
                <div className="lg:col-span-2 glass-card p-5 rounded-2xl border border-navy-border shadow-glass">
                  <h3 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wider mb-4 flex items-center">
                    <Activity className="h-4 w-4 text-safety-crimson mr-1" /> MONTHLY INCIDENT RATE CURVE
                  </h3>
                  <div className="h-64 relative">
                    <Line data={getLineChartData()} options={chartOptions} />
                  </div>
                </div>

                {/* Theft category Distribution */}
                <div className="glass-card p-5 rounded-2xl border border-navy-border shadow-glass flex flex-col">
                  <h3 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wider mb-4 flex items-center">
                    <PieChart className="h-4 w-4 text-[#A855F7] mr-1" /> CATEGORY DISTRIBUTION
                  </h3>
                  <div className="h-48 relative flex-1">
                    <Doughnut
                      data={getDoughnutChartData()}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom',
                            labels: { color: '#94A3B8', font: { family: 'Inter', size: 9 } }
                          }
                        }
                      }}
                    />
                  </div>
                </div>

              </div>

              {/* Status breakdown bar chart */}
              <div className="glass-card p-5 rounded-2xl border border-navy-border shadow-glass">
                <h3 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wider mb-4 flex items-center">
                  <CheckSquare className="h-4 w-4 text-blue-400 mr-1" /> PROCESS STAGE BREAKDOWN
                </h3>
                <div className="h-64 relative">
                  <Bar data={getBarChartData()} options={chartOptions} />
                </div>
              </div>

            </div>
          )}

          {/* CASE MANAGER TAB VIEW */}
          {activeTab === 'cases' && (
            <div className="glass-card rounded-2xl border border-navy-border overflow-hidden shadow-glass">
              <div className="px-4 py-3 bg-navy-medium border-b border-navy-border flex justify-between items-center">
                <span className="font-bold text-xs font-mono">Dossier assignment list</span>
                <span className="text-[9px] font-mono text-slate-light">TOTAL ACTIVE CASES: {cases.length}</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-navy-dark text-slate-light uppercase text-[9px] font-mono border-b border-navy-border/60">
                    <tr>
                      <th className="px-4 py-3">Case ID</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Citizen</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Assigned Officer</th>
                      <th className="px-4 py-3">Date Filed</th>
                      <th className="px-4 py-3 text-right">Officer Assignment Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy-border/50">
                    {cases.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-4 py-8 text-center text-slate-gray font-mono italic">
                          No case records exist.
                        </td>
                      </tr>
                    ) : (
                      cases.map((c) => (
                        <tr key={c._id} className="hover:bg-navy-light/10 transition">
                          <td className="px-4 py-3 font-mono font-bold text-slate-200">{c.caseId}</td>
                          <td className="px-4 py-3 font-semibold">{c.theftType}</td>
                          <td className="px-4 py-3 font-sans">
                            <span className="block font-semibold">{c.citizen.name}</span>
                            <span className="text-[10px] text-slate-gray font-mono">{c.citizen.phoneNumber}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold capitalize ${
                              c.status === 'Resolved' ? 'text-safety-emerald bg-safety-emerald/10 border border-safety-emerald/25' :
                              (c.status === 'Investigating' || c.status === 'Evidence Verification') ? 'text-safety-amber bg-safety-amber/10 border border-safety-amber/25' :
                              'text-safety-crimson bg-safety-crimson/10 border border-safety-crimson/25'
                            }`}>{c.status}</span>
                          </td>
                          <td className="px-4 py-3">
                            {c.assignedOfficer && c.assignedOfficer.name ? (
                              <div className="flex items-center space-x-1 text-slate-300">
                                <Award className="h-3 w-3 text-safety-amber" />
                                <span>{c.assignedOfficer.name}</span>
                                <span className="text-[10px] text-slate-gray font-mono">({c.assignedOfficer.badgeNumber})</span>
                              </div>
                            ) : (
                              <span className="text-[10px] text-safety-crimson font-mono italic">Unassigned</span>
                            )}
                          </td>
                          <td className="px-4 py-3 font-mono text-slate-gray">{new Date(c.createdAt).toLocaleDateString()}</td>
                          <td className="px-4 py-3 text-right">
                            <select
                              onChange={(e) => handleAssignOfficer(c._id, e.target.value)}
                              defaultValue=""
                              className="py-1 px-1.5 rounded bg-navy-dark border border-navy-border text-[10px] focus:outline-none max-w-[150px] overflow-hidden truncate font-sans"
                            >
                              <option value="" disabled>-- Select Officer --</option>
                              {officers.map(o => (
                                <option key={o._id} value={o._id}>
                                  {o.name} ({o.badgeNumber})
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* USER DIRECTORY TAB VIEW */}
          {activeTab === 'users' && (
            <div className="space-y-8">
              {/* PENDING OFFICERS APPROVAL QUEUE */}
              {users.filter(u => u.role === 'officer' && !u.isActive).length > 0 && (
                <div className="glass-card rounded-2xl border border-safety-amber/30 overflow-hidden shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                  <div className="px-4 py-3 bg-safety-amber/5 border-b border-safety-amber/20 flex justify-between items-center text-safety-amber font-mono font-bold text-xs uppercase tracking-wider">
                    <span className="flex items-center space-x-1.5">
                      <Shield className="h-4 w-4 animate-pulse" />
                      <span>Officer Accreditation Approvals Required ({users.filter(u => u.role === 'officer' && !u.isActive).length})</span>
                    </span>
                    <span className="text-[9px] font-semibold bg-safety-amber/15 border border-safety-amber/20 px-2 py-0.5 rounded-full">
                      Verification Queue
                    </span>
                  </div>

                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {users.filter(u => u.role === 'officer' && !u.isActive).map((o) => (
                      <div key={o._id} className="bg-navy-medium/60 rounded-xl p-4 border border-navy-border/60 hover:border-navy-border transition flex flex-col justify-between space-y-4">
                        <div className="grid grid-cols-2 gap-3 text-xs bg-navy-dark/45 p-3 rounded-lg border border-navy-border/40 font-mono text-slate-light">
                          <div className="col-span-2 pb-1 border-b border-navy-border/30 mb-1 flex items-center justify-between">
                            <span className="text-[10px] text-slate-gray uppercase font-bold">POLICE OFFICER CANDIDATE</span>
                            <span className="text-[9px] font-sans bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded font-bold uppercase">{o.role}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-gray block uppercase">Full Name</span>
                            <span className="text-slate-200 font-sans font-bold block">{o.name}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-gray block uppercase">Email Address</span>
                            <span className="text-slate-200 block truncate">{o.email}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-gray block uppercase">Phone Number</span>
                            <span className="text-slate-200 block">{o.phoneNumber}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-gray block uppercase">Submission Date</span>
                            <span className="text-slate-200 block">{new Date(o.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-gray block uppercase">Badge Reference ID</span>
                            <span className="text-[#D9A752] font-bold block">{o.badgeNumber}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-gray block uppercase">Department Division</span>
                            <span className="text-blue-400 font-semibold block">{o.department}</span>
                          </div>
                        </div>

                        {/* ID Card image block */}
                        {o.idCardImage ? (
                          <div className="space-y-1.5">
                            <span className="block text-[9px] font-mono uppercase text-slate-gray">POLICE ID CARD ATTACHMENT</span>
                            <div className="relative group max-w-[200px] rounded-lg overflow-hidden border border-navy-border/60">
                              <img
                                src={o.idCardImage}
                                alt="Officer Police ID Card"
                                className="w-full h-24 object-cover cursor-zoom-in group-hover:scale-105 transition duration-300"
                                onClick={() => setSelectedIdImage(o.idCardImage)}
                              />
                              <div
                                onClick={() => setSelectedIdImage(o.idCardImage)}
                                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-mono font-semibold transition duration-200 cursor-pointer"
                              >
                                <Eye className="h-4 w-4 mr-1" /> View ID
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 bg-red-500/5 border border-red-500/15 rounded text-[10px] text-red-400 font-mono">
                            No ID image uploaded
                          </div>
                        )}

                        <div className="flex space-x-3 pt-2 border-t border-navy-border/40">
                          <button
                            onClick={() => handleToggleUserStatus(o._id, false)}
                            className="flex-1 py-1.5 bg-safety-emerald hover:bg-emerald-600 text-black text-xs font-semibold rounded transition flex items-center justify-center space-x-1"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleRejectOfficer(o._id)}
                            className="flex-1 py-1.5 bg-safety-crimson/10 hover:bg-safety-crimson/25 border border-safety-crimson/30 text-safety-crimson text-xs font-semibold rounded transition flex items-center justify-center space-x-1"
                          >
                            <X className="h-3.5 w-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* REGISTERED POLICE OFFICERS DIRECTORY */}
              <div className="glass-card rounded-2xl border border-navy-border overflow-hidden shadow-glass">
                <div className="px-4 py-3 bg-navy-medium border-b border-navy-border flex justify-between items-center">
                  <div className="flex items-center space-x-1.5">
                    <Shield className="h-4 w-4 text-[#D9A752]" />
                    <span className="font-bold text-xs font-mono">Accredited Police Officers Directory</span>
                  </div>
                  <span className="text-[9px] font-mono text-slate-light">ACTIVE OFFICERS: {users.filter(u => u.role === 'officer' && u.isActive).length}</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-navy-dark text-slate-light uppercase text-[9px] font-mono border-b border-navy-border/60">
                      <tr>
                        <th className="px-4 py-3">Officer</th>
                        <th className="px-4 py-3">Email</th>
                        <th className="px-4 py-3">Phone</th>
                        <th className="px-4 py-3">Badge Number</th>
                        <th className="px-4 py-3">Department Division</th>
                        <th className="px-4 py-3">Enrollment Date</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-navy-border/50">
                      {users.filter(u => u.role === 'officer' && u.isActive).length === 0 ? (
                        <tr>
                          <td colSpan="7" className="px-4 py-8 text-center text-slate-gray font-mono italic">
                            No active officers registered.
                          </td>
                        </tr>
                      ) : (
                        users.filter(u => u.role === 'officer' && u.isActive).map((u) => (
                          <tr key={u._id} className="hover:bg-navy-light/10 transition">
                            <td className="px-4 py-3 font-semibold text-slate-200">{u.name}</td>
                            <td className="px-4 py-3 font-mono">{u.email}</td>
                            <td className="px-4 py-3 font-mono text-slate-gray">{u.phoneNumber}</td>
                            <td className="px-4 py-3 font-mono font-bold text-[#D9A752]">{u.badgeNumber}</td>
                            <td className="px-4 py-3 font-sans text-slate-300">{u.department}</td>
                            <td className="px-4 py-3 font-mono text-slate-gray">{new Date(u.createdAt).toLocaleDateString()}</td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end space-x-2">
                                {u.idCardImage && (
                                  <button
                                    onClick={() => setSelectedIdImage(u.idCardImage)}
                                    className="p-1 text-slate-gray hover:text-white transition"
                                    title="View ID Card"
                                  >
                                    <Eye className="h-3.5 w-3.5" />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleToggleUserStatus(u._id, u.isActive)}
                                  className="px-2 py-1 rounded text-[9px] font-mono font-semibold flex items-center space-x-1 bg-safety-emerald/10 text-safety-emerald hover:bg-safety-emerald/20 border border-safety-emerald/30 transition"
                                >
                                  <Power className="h-2.5 w-2.5" />
                                  <span>DEACTIVATE</span>
                                </button>
                                <button
                                  onClick={() => handleRejectOfficer(u._id)}
                                  className="p-1 text-slate-gray hover:text-red-500 transition"
                                  title="Delete Account"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* CITIZENS AND REPORTED ACTIONS DIRECTORY */}
              <div className="glass-card rounded-2xl border border-navy-border overflow-hidden shadow-glass">
                <div className="px-4 py-3 bg-navy-medium border-b border-navy-border flex justify-between items-center">
                  <div className="flex items-center space-x-1.5">
                    <Users className="h-4 w-4 text-blue-400" />
                    <span className="font-bold text-xs font-mono">Citizen Profiles & Reported Actions</span>
                  </div>
                  <span className="text-[9px] font-mono text-slate-light">ACTIVE CITIZENS: {users.filter(u => u.role === 'citizen').length}</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-navy-dark text-slate-light uppercase text-[9px] font-mono border-b border-navy-border/60">
                      <tr>
                        <th className="px-4 py-3">Citizen</th>
                        <th className="px-4 py-3">Email Address</th>
                        <th className="px-4 py-3">Phone Number</th>
                        <th className="px-4 py-3">Enrollment Date</th>
                        <th className="px-4 py-3 text-center">Cases Filed</th>
                        <th className="px-4 py-3 text-right">Actions Log</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-navy-border/50">
                      {users.filter(u => u.role === 'citizen').length === 0 ? (
                        <tr>
                          <td colSpan="6" className="px-4 py-8 text-center text-slate-gray font-mono italic">
                            No citizen accounts registered.
                          </td>
                        </tr>
                      ) : (
                        users.filter(u => u.role === 'citizen').map((u) => {
                          const citizenCases = cases.filter(c => c.citizen && (String(c.citizen._id) === String(u._id) || c.citizen.email === u.email));
                          const isExpanded = expandedCitizenId === u._id;
                          
                          return (
                            <React.Fragment key={u._id}>
                              <tr className="hover:bg-navy-light/10 transition">
                                <td className="px-4 py-3 font-semibold text-slate-200">{u.name}</td>
                                <td className="px-4 py-3 font-mono">{u.email}</td>
                                <td className="px-4 py-3 font-mono text-slate-gray">{u.phoneNumber}</td>
                                <td className="px-4 py-3 font-mono text-slate-gray">{new Date(u.createdAt).toLocaleDateString()}</td>
                                <td className="px-4 py-3 text-center font-bold text-slate-200">
                                  <span className={`px-2 py-0.5 rounded font-mono text-[10px] ${citizenCases.length > 0 ? 'bg-navy-light/20 text-[#D9A752] border border-[#D9A752]/20' : 'bg-navy-dark text-slate-light'}`}>
                                    {citizenCases.length} {citizenCases.length === 1 ? 'Case' : 'Cases'}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <div className="flex items-center justify-end space-x-2">
                                    <button
                                      onClick={() => {
                                        if (expandedCitizenId === u._id) {
                                          setExpandedCitizenId(null);
                                        } else {
                                          setExpandedCitizenId(u._id);
                                        }
                                      }}
                                      className={`px-2.5 py-1 rounded text-[10px] font-mono font-semibold flex items-center space-x-1 transition ${
                                        isExpanded
                                          ? 'bg-navy-light text-black font-bold'
                                          : 'bg-navy-medium hover:bg-navy-light/35 text-slate-light hover:text-white border border-navy-border'
                                      }`}
                                    >
                                      <ClipboardList className="h-3 w-3" />
                                      <span>{isExpanded ? 'HIDE ACTIONS' : 'VIEW ACTIONS'}</span>
                                      {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                    </button>
                                    <button
                                      onClick={() => handleRejectOfficer(u._id)}
                                      className="p-1 text-slate-gray hover:text-red-500 transition"
                                      title="Delete Account"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>

                              {/* Expanded reported cases section */}
                              {isExpanded && (
                                <tr>
                                  <td colSpan="6" className="px-4 py-3 bg-navy-dark/40 border-l-2 border-l-[#D9A752]">
                                    <div className="p-3 bg-navy-medium/35 rounded-lg border border-navy-border/50">
                                      <h4 className="text-[10px] font-mono text-slate-light uppercase tracking-wider mb-2.5 flex items-center">
                                        <ClipboardList className="h-3.5 w-3.5 text-navy-light mr-1" />
                                        <span>Incident Reporting & Dossier History for {u.name}</span>
                                      </h4>
                                      
                                      {citizenCases.length === 0 ? (
                                        <p className="text-[11px] text-slate-gray font-mono italic p-2 bg-navy-dark/30 rounded border border-navy-border/30">
                                          This citizen has not reported any theft incidents in the system.
                                        </p>
                                      ) : (
                                        <div className="overflow-hidden border border-navy-border/40 rounded-lg">
                                          <table className="w-full text-left text-[11px]">
                                            <thead className="bg-navy-dark text-slate-light uppercase text-[9px] font-mono border-b border-navy-border/60">
                                              <tr>
                                                <th className="px-3 py-2">Case ID</th>
                                                <th className="px-3 py-2">Theft Category</th>
                                                <th className="px-3 py-2">Incident Date</th>
                                                <th className="px-3 py-2">Status</th>
                                                <th className="px-3 py-2">Assigned Officer</th>
                                              </tr>
                                            </thead>
                                            <tbody className="divide-y divide-navy-border/40 font-mono text-slate-200">
                                              {citizenCases.map((cc) => (
                                                <tr key={cc._id} className="hover:bg-navy-light/10 transition">
                                                  <td className="px-3 py-2 font-bold text-navy-light">{cc.caseId}</td>
                                                  <td className="px-3 py-2 font-sans font-semibold">{cc.theftType}</td>
                                                  <td className="px-3 py-2 text-slate-gray">{new Date(cc.incidentDate).toLocaleDateString()}</td>
                                                  <td className="px-3 py-2">
                                                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold capitalize font-sans ${
                                                      cc.status === 'Resolved' ? 'text-safety-emerald bg-safety-emerald/10 border border-safety-emerald/25' :
                                                      (cc.status === 'Investigating' || cc.status === 'Evidence Verification') ? 'text-safety-amber bg-safety-amber/10 border border-safety-amber/25' :
                                                      'text-safety-crimson bg-safety-crimson/10 border border-safety-crimson/25'
                                                    }`}>{cc.status}</span>
                                                  </td>
                                                  <td className="px-3 py-2 font-sans">
                                                    {cc.assignedOfficer && cc.assignedOfficer.name ? (
                                                      <span className="text-slate-300 font-semibold">{cc.assignedOfficer.name} <span className="font-mono text-[9px] text-slate-gray">({cc.assignedOfficer.badgeNumber})</span></span>
                                                    ) : (
                                                      <span className="text-slate-gray italic text-[10px]">Awaiting Assignment</span>
                                                    )}
                                                  </td>
                                                </tr>
                                              ))}
                                            </tbody>
                                          </table>
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-6">
              <div className="glass-card rounded-2xl border border-navy-border overflow-hidden shadow-glass">
                <div className="px-4 py-3 bg-navy-medium border-b border-navy-border flex justify-between items-center">
                  <div className="flex items-center space-x-1.5">
                    <Activity className="h-4 w-4 text-[#D9A752]" />
                    <span className="font-bold text-xs font-mono">System Audit Log Trail</span>
                  </div>
                  <span className="text-[9px] font-mono text-slate-light">ENTRIES LOGGED: {logs.length}</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-navy-dark text-slate-light uppercase text-[9px] font-mono border-b border-navy-border/60">
                      <tr>
                        <th className="px-4 py-3">Timestamp</th>
                        <th className="px-4 py-3">Action</th>
                        <th className="px-4 py-3">Event Details</th>
                        <th className="px-4 py-3 text-right">Actor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-navy-border/50 font-mono text-slate-200">
                      {logs.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="px-4 py-8 text-center text-slate-gray italic">
                            No system log records found.
                          </td>
                        </tr>
                      ) : (
                        logs.map((log) => (
                          <tr key={log._id} className="hover:bg-navy-light/10 transition">
                            <td className="px-4 py-3 text-slate-gray whitespace-nowrap">
                              {new Date(log.createdAt).toLocaleString()}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                log.action.includes('SUCCESS') || log.action.includes('CHANGED') 
                                  ? 'bg-safety-emerald/20 text-safety-emerald'
                                  : log.action.includes('REQUEST')
                                  ? 'bg-safety-amber/20 text-safety-amber'
                                  : 'bg-blue-500/20 text-blue-400'
                              }`}>
                                {log.action}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-slate-light max-w-md break-words font-sans">
                              {log.details}
                            </td>
                            <td className="px-4 py-3 text-right text-slate-gray whitespace-nowrap">
                              {log.performedBy}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ID Card Image Zoom Modal Overlay */}
      {selectedIdImage && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative max-w-3xl w-full flex flex-col items-center">
            <button
              onClick={() => setSelectedIdImage(null)}
              className="absolute -top-10 right-0 p-2 text-slate-light hover:text-white transition bg-navy-medium border border-navy-border rounded-full cursor-pointer"
              title="Close viewer"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={selectedIdImage}
              alt="Accredited ID Card Zoomed"
              className="max-h-[80vh] w-auto max-w-full rounded-lg border border-navy-border shadow-2xl object-contain"
            />
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
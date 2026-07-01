import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Shield, FileText, CheckCircle2, Radio, MapPin, Eye, Brain, ArrowRight, Laptop, Smartphone, MessageSquare } from 'lucide-react';
import CitySkyline from '../components/CitySkyline';
import DashboardMap from '../components/DashboardMap';

const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalIncidents: 3,
    resolvedCases: 1,
    pendingCases: 2,
    resolutionRate: 33
  });
  const [mockCases, setMockCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [locationPermissionStatus, setLocationPermissionStatus] = useState('prompt'); // 'prompt', 'granted', 'denied'

  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
          setLocationPermissionStatus('granted');
        },
        (error) => {
          console.log('Geolocation error or denied:', error);
          setLocationPermissionStatus('denied');
        }
      );
    } else {
      setLocationPermissionStatus('unsupported');
    }
  };

  useEffect(() => {
    requestLocation();
  }, []);

  useEffect(() => {
    const fetchLandingData = async () => {
      try {
        const res = await axios.get(`${API_URL}/analytics`);
        if (res.data.success) {
          setStats(res.data.data.summary);
        }
      } catch (err) {
        console.log('Using default mock stats for offline landing demo.');
      }

      // Fetch cases to plot on map
      try {
        const res = await axios.get(`${API_URL}/cases`);
        if (res.data.success && res.data.data.length > 0) {
          setMockCases(res.data.data);
        } else {
          setMockCases(getFallbackMockCases());
        }
      } catch (err) {
        setMockCases(getFallbackMockCases());
      } finally {
        setLoading(false);
      }
    };

    fetchLandingData();
  }, []);

  const getFallbackMockCases = () => [
    {
      _id: '1',
      caseId: 'THF-2026-001',
      theftType: 'Mobile Theft',
      status: 'Investigating',
      location: { coordinates: [-73.98513, 40.758896], address: 'Times Square, New York, NY' },
      incidentDate: new Date(),
    },
    {
      _id: '2',
      caseId: 'THF-2026-002',
      theftType: 'Vehicle Theft',
      status: 'Reported',
      location: { coordinates: [-74.0060, 40.7128], address: 'Downtown Parking Garage, NY' },
      incidentDate: new Date(),
    },
    {
      _id: '3',
      caseId: 'THF-2026-003',
      theftType: 'Burglary',
      status: 'Resolved',
      location: { coordinates: [-73.9500, 40.8000], address: 'West 125th St, Harlem, NY' },
      incidentDate: new Date(),
    }
  ];

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Hero Section */}
      <div className="relative overflow-hidden pt-12 pb-8 md:pt-20 md:pb-12 text-center px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Tagline Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-navy-light/10 border border-navy-light/35 text-navy-light text-xs font-mono font-bold tracking-widest uppercase shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-navy-light animate-pulse"></span>
            <span>Report. Track. Protect.</span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-5xl md:text-6xl font-bold font-sans tracking-tight text-white leading-tight"
          >
            Theft Protection: <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-navy-light via-white to-navy-light bg-clip-text text-transparent">
              An Intelligent Reporting System
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-sm sm:text-lg text-slate-light max-w-2xl mx-auto font-sans leading-relaxed"
          >
            Report theft incidents quickly online, track investigation progress transparently, and strengthen community safety through an intelligent digital portal designed for modern smart cities.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row justify-center items-center gap-3 pt-4"
          >
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-3 bg-navy-light hover:bg-[#C5933E] text-sm font-semibold rounded-lg text-black transition duration-200 shadow-[0_0_15px_rgba(217,167,82,0.3)] flex items-center justify-center space-x-1.5"
            >
              <span>REPORT INCIDENT</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            
            <Link
              to="/track-case"
              className="w-full sm:w-auto px-8 py-3 bg-navy-medium border border-navy-border hover:bg-[#202024] text-sm font-semibold rounded-lg text-white transition duration-200 shadow-md"
            >
              TRACK AN EXISTENT CASE
            </Link>
          </motion.div>

        </div>
      </div>

      {/* Main Stats Widgets Section */}
      {user && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="glass-card p-6 rounded-xl relative overflow-hidden flex flex-col justify-between border-l-4 border-l-blue-400 shadow-glass"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-mono text-slate-light tracking-wider uppercase">TOTAL CASES FILED</p>
                  <h3 className="text-3xl font-bold font-sans mt-2">{stats.totalIncidents}</h3>
                </div>
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                  <FileText className="h-5 w-5" />
                </div>
              </div>
              <div className="text-[10px] text-slate-gray mt-4 font-mono">PUBLIC REPORT METRICS</div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="glass-card p-6 rounded-xl relative overflow-hidden flex flex-col justify-between border-l-4 border-l-safety-emerald shadow-glass"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-mono text-slate-light tracking-wider uppercase">RESOLVED FILES</p>
                  <h3 className="text-3xl font-bold font-sans text-safety-emerald mt-2">{stats.resolvedCases}</h3>
                </div>
                <div className="p-2 bg-safety-emerald/10 rounded-lg text-safety-emerald">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              </div>
              <div className="text-[10px] text-safety-emerald mt-4 font-mono font-semibold">
                {stats.resolutionRate}% OF INCIDENTS RESOLVED
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="glass-card p-6 rounded-xl relative overflow-hidden flex flex-col justify-between border-l-4 border-l-safety-crimson shadow-glass"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-mono text-slate-light tracking-wider uppercase">ACTIVE QUEUE</p>
                  <h3 className="text-3xl font-bold font-sans text-safety-crimson mt-2">{stats.pendingCases}</h3>
                </div>
                <div className="p-2 bg-safety-crimson/10 rounded-lg text-safety-crimson">
                  <Radio className="h-5 w-5 animate-pulse" />
                </div>
              </div>
              <div className="text-[10px] text-slate-gray mt-4 font-mono">UNDER INVESTIGATION & VERIFICATION</div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="glass-card p-6 rounded-xl relative overflow-hidden flex flex-col justify-between border-l-4 border-l-[#A855F7] shadow-glass"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-mono text-slate-light tracking-wider uppercase">SYSTEM COVERAGE</p>
                  <h3 className="text-3xl font-bold font-sans text-[#A855F7] mt-2">100%</h3>
                </div>
                <div className="p-2 bg-[#A855F7]/10 rounded-lg text-[#A855F7]">
                  <Shield className="h-5 w-5" />
                </div>
              </div>
              <div className="text-[10px] text-[#A855F7] mt-4 font-mono font-semibold">COMMAND PORTAL ONLINE</div>
            </motion.div>

          </div>
        </div>
      )}

      {/* Incident Map Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-6">
        <div className="glass-card p-6 rounded-2xl shadow-glass flex flex-col lg:flex-row gap-6">
          <div className="lg:w-1/3 flex flex-col justify-between space-y-4">
            <div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-navy-light/10 border border-navy-light/35 text-navy-light font-mono font-bold">LIVE INCIDENT MATRIX</span>
              <h2 className="text-2xl font-bold text-white mt-3 leading-tight">Hotspot & Incident Geolocation Grid</h2>
              <p className="text-slate-light text-xs mt-3 leading-relaxed">
                Incident reports submitted online are immediately mapped and categorized. This enables dispatch departments, patrol divisions, and administrative monitors to trace local crime clusters and distribute patrol assets strategically.
              </p>
            </div>
            <div className="space-y-2.5 font-mono text-[11px] text-slate-light bg-navy-medium/40 p-3 rounded-lg border border-navy-border/50">
              <div className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-safety-crimson inline-block mr-2 shadow-[0_0_5px_rgba(239,68,68,0.5)]"></span> Newly Reported Active Incidents</div>
              <div className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-safety-amber inline-block mr-2 shadow-[0_0_5px_rgba(245,158,11,0.5)]"></span> Under Active Investigation</div>
              <div className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-safety-emerald inline-block mr-2 shadow-[0_0_5px_rgba(16,185,129,0.5)]"></span> Resolved Case Closed Files</div>
            </div>
          </div>
          
          <div className="flex-1 min-h-[350px]">
            {locationPermissionStatus !== 'granted' && (
              <div className="mb-4 p-3 bg-navy-medium/60 border border-navy-light/35 rounded-xl flex items-center justify-between text-xs text-slate-light font-mono shadow-sm">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-[#D9A752] animate-bounce shrink-0" />
                  <span>
                    {locationPermissionStatus === 'denied'
                      ? 'Location services are disabled. Please enable location permissions in your browser to center the map on your area.'
                      : 'To view theft hotspots and incident geolocations near you, please grant location access.'}
                  </span>
                </div>
                {locationPermissionStatus === 'prompt' && (
                  <button
                    onClick={requestLocation}
                    className="px-3 py-1 bg-[#D9A752] hover:bg-[#C5933E] text-black text-[10px] font-bold rounded transition shrink-0 ml-2"
                  >
                    GRANT ACCESS
                  </button>
                )}
              </div>
            )}

            {!loading && (
              <DashboardMap 
                cases={mockCases} 
                height="360px" 
                userLocation={userLocation} 
                showUserLocation={true} 
              />
            )}
            {loading && (
              <div className="w-full h-[360px] bg-navy-medium/30 rounded-xl border border-navy-border flex items-center justify-center font-mono text-xs text-slate-light">
                <span className="animate-pulse">LOADING DASHBOARD HEAT MAP TILES...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Future Scope Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-8">
        <div className="text-center mb-8">
          <span className="text-[10px] font-mono text-safety-emerald font-bold tracking-widest uppercase">FUTURE INTEGRATION ROADMAP</span>
          <h2 className="text-2xl font-bold text-white mt-1">Smart Safety Command Capabilities</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-xl border-t-2 border-t-blue-400">
            <Smartphone className="h-6 w-6 text-blue-400 mb-4" />
            <h4 className="font-semibold text-sm text-slate-200">Mobile Native Frameworks</h4>
            <p className="text-xs text-slate-light mt-2 leading-relaxed">
              Design of iOS/Android applications allowing rapid offline field reporting, quick fingerprint lockups, and push alerts powered by Google Firebase.
            </p>
          </div>
          <div className="glass-card p-6 rounded-xl border-t-2 border-t-safety-amber">
            <Brain className="h-6 w-6 text-safety-amber mb-4" />
            <h4 className="font-semibold text-sm text-slate-200">AI-Powered Predictive Patrolling</h4>
            <p className="text-xs text-slate-light mt-2 leading-relaxed">
              Integration of TensorFlow forecasting tools to project high-risk areas using time blocks, calendar conditions, and history trends.
            </p>
          </div>
          <div className="glass-card p-6 rounded-xl border-t-2 border-t-safety-emerald">
            <MessageSquare className="h-6 w-6 text-safety-emerald mb-4" />
            <h4 className="font-semibold text-sm text-slate-200">SMS & Dispatch Channels</h4>
            <p className="text-xs text-slate-light mt-2 leading-relaxed">
              Real-time SMS broadcast pipelines powered by Twilio, relaying notification alerts straight to patrol officers' field terminals.
            </p>
          </div>
        </div>
      </div>

      {/* Skyline Animation Footer */}
      <CitySkyline />
    </div>
  );
};

export default LandingPage;
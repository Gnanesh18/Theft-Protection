import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Shield, Key, Mail, ArrowRight, AlertCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';

const CitizenLogin = () => {
  const { login, logout, user } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // If user is already logged in with citizen role, redirect. Otherwise, log out.
  useEffect(() => {
    if (user) {
      if (user.role === 'citizen') {
        navigate('/citizen');
      } else {
        logout();
      }
    }
  }, [user, navigate, logout]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return setError('Please fill in all fields.');
    }
    setError('');
    setSubmitting(true);
    
    const result = await login(email, password);
    
    if (result.success) {
      const loggedUser = result.user;
      if (loggedUser.role !== 'citizen') {
        logout();
        setSubmitting(false);
        setError('Access Denied: This portal is reserved for Citizen accounts. Please use the correct login page.');
      } else {
        setSubmitting(false);
        navigate('/citizen');
      }
    } else {
      setSubmitting(false);
      setError(result.message);
    }
  };


  return (
    <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative grid-bg min-h-[calc(100vh-4rem)]">
      {/* Back button */}
      <div className="absolute top-6 left-6 z-10">
        <Link
          to="/login"
          className="flex items-center space-x-1.5 text-xs text-slate-light hover:text-white transition duration-200"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Portals</span>
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full space-y-6 glass-card p-8 rounded-2xl border border-safety-emerald/30 shadow-[0_0_15px_rgba(16,185,129,0.15)] relative"
      >
        <div className="text-center relative">
          <span className="absolute -top-3 right-0 text-[8px] font-mono tracking-widest px-2 py-0.5 rounded-full border bg-navy-medium text-safety-emerald border-safety-emerald/20">
            PUBLIC ACCESS
          </span>

          <div className="mx-auto h-12 w-12 bg-navy-medium rounded-full flex items-center justify-center border border-safety-emerald/30 text-safety-emerald">
            <Shield className="h-6 w-6" />
          </div>
          <h2 className="mt-3 text-2xl font-bold font-sans text-white">Citizen Portal</h2>
          <p className="mt-1 text-xs text-slate-light">Secure Incident Reporting & Case Tracking</p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/25 rounded-lg flex items-start space-x-2 text-xs text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-light mb-1.5">EMAIL IDENTITY</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-gray">
                <Mail className="h-4 w-4" />
              </span>
               <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm glass-input font-mono"
                placeholder=""
                required
                autoComplete="off"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-[10px] font-mono uppercase text-slate-light">ENCRYPTED PASSCODE</label>
              <Link to="/forgot-password" className="text-[10px] text-slate-light hover:text-white transition">
                Forgot Passcode?
              </Link>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-gray">
                <Key className="h-4 w-4" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-lg text-sm glass-input font-mono"
                placeholder=""
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-gray hover:text-white transition cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 text-sm font-semibold rounded-lg transition duration-200 flex items-center justify-center space-x-1 bg-safety-emerald hover:bg-emerald-600 text-black shadow-md"
          >
            <span>{submitting ? 'AUTHORIZING ACCESS...' : 'SECURE LOGIN'}</span>
            {!submitting && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        <p className="text-center text-xs text-slate-light">
          No account registered yet?{' '}
          <Link to="/register/citizen" className="text-white hover:underline font-semibold font-sans">
            Report theft & Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default CitizenLogin;

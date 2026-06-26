import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Shield, User, Mail, Key, Phone, AlertCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';

const CitizenRegister = () => {
  const { register, user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
    role: 'citizen'
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // If user is already logged in, redirect them
  useEffect(() => {
    if (user) {
      if (user.role === 'citizen') navigate('/citizen');
      else if (user.role === 'officer') navigate('/officer');
      else if (user.role === 'admin') navigate('/admin');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, phoneNumber } = formData;

    if (!name || !email || !password || !phoneNumber) {
      return setError('Please fill in all fields.');
    }

    // Validate password criteria
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasDigit = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (password.length < 8) {
      return setError('Password must be at least 8 characters long.');
    }
    if (!hasUpperCase) {
      return setError('Password must contain at least one uppercase letter.');
    }
    if (!hasLowerCase) {
      return setError('Password must contain at least one lowercase letter.');
    }
    if (!hasDigit) {
      return setError('Password must contain at least one digit.');
    }
    if (!hasSpecialChar) {
      return setError('Password must contain at least one special character (e.g., ! @ # $ % ^ & *).');
    }

    setError('');
    setSubmitting(true);

    const signUpData = { name, email, password, phoneNumber, role: 'citizen' };

    const result = await register(signUpData);
    setSubmitting(false);

    if (result.success) {
      navigate('/citizen');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative grid-bg min-h-[calc(100vh-4rem)]">
      {/* Back button */}
      <div className="absolute top-6 left-6 z-10">
        <Link
          to="/register"
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
          <h2 className="mt-3 text-2xl font-bold font-sans text-white">Citizen Registration</h2>
          <p className="mt-1.5 text-xs text-slate-light font-mono">ENROLL NEW CITIZEN PROFILE</p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/25 rounded-lg flex items-center space-x-2 text-xs text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-light mb-1.5">FULL NAME</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-gray">
                <User className="h-4 w-4" />
              </span>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm glass-input font-sans"
                placeholder=""
                required
                autoComplete="off"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-light mb-1.5">EMAIL IDENTITY</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-gray">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm glass-input font-mono"
                placeholder=""
                required
                autoComplete="off"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-light mb-1.5">PHONE NUMBER</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-gray">
                <Phone className="h-4 w-4" />
              </span>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm glass-input font-mono"
                placeholder=""
                required
                autoComplete="off"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-light mb-1.5">PASSPHRASE</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-gray">
                <Key className="h-4 w-4" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
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
            className="w-full py-2.5 bg-safety-emerald hover:bg-emerald-600 text-sm font-bold rounded-lg text-black transition duration-200 shadow-md"
          >
            {submitting ? 'ENROLLING PROFILE...' : 'REGISTER & LOGIN'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-light">
          Already registered?{' '}
          <Link to="/login/citizen" className="text-white hover:underline font-semibold font-sans">
            Secure Citizen Login
          </Link>
        </p>

      </motion.div>
    </div>
  );
};

export default CitizenRegister;

import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Shield, KeyRound, CheckCircle, ArrowLeft, AlertCircle, Eye, EyeOff } from 'lucide-react';

const ResetPassword = () => {
  const { id } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!password || !confirmPassword) {
      return setError('Please fill in all fields.');
    }

    if (password !== confirmPassword) {
      return setError('Passwords do not match.');
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

    setSubmitting(true);

    try {
      const res = await axios.post(`http://localhost:5001/api/auth/reset-password/${id}`, { password });
      if (res.data.success) {
        setSuccessMessage(res.data.message || 'Password successfully updated.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Server error. Password update failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative grid-bg min-h-[calc(100vh-4rem)]">
      {/* Background Decorative Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-navy-light/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full space-y-6 glass-card p-8 rounded-2xl shadow-glass border border-navy-border/70 relative z-10"
      >
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-navy-light/10 border border-navy-light/35 rounded-full flex items-center justify-center text-navy-light">
            <Shield className="h-6 w-6" />
          </div>
          <h2 className="mt-3 text-2xl font-bold font-sans">Establish New Passcode</h2>
          <p className="mt-1.5 text-xs text-slate-light font-mono">SECURE ACCESS RESTORATION</p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/25 rounded-lg flex items-center space-x-2 text-xs text-red-500">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4 text-center"
          >
            <div className="mx-auto h-10 w-10 bg-safety-emerald/10 border border-safety-emerald/30 rounded-full flex items-center justify-center text-safety-emerald mb-2">
              <CheckCircle className="h-5 w-5" />
            </div>
            <p className="text-xs text-slate-light leading-relaxed font-sans">
              {successMessage}
            </p>
            <Link
              to="/login"
              className="inline-flex items-center space-x-1 text-xs text-slate-light hover:text-white transition font-mono border-b border-dashed border-slate-gray mt-2"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>RETURN TO LOGIN</span>
            </Link>
          </motion.div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <p className="text-xs text-slate-light leading-relaxed font-sans">
              Define a strong password meeting standard safety criteria.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-light mb-1.5">NEW PASSWORD</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-gray">
                    <KeyRound className="h-4 w-4" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-lg text-sm glass-input font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-gray hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-light mb-1.5">CONFIRM PASSWORD</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-gray">
                    <KeyRound className="h-4 w-4" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-lg text-sm glass-input font-mono"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-navy-light hover:bg-[#C5933E] text-sm font-bold rounded-lg text-black transition duration-200 shadow-[0_0_10px_rgba(217,167,82,0.25)]"
            >
              {submitting ? 'UPDATING CREDENTIALS...' : 'RESET PASSWORD'}
            </button>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="inline-flex items-center space-x-1 text-xs text-slate-light hover:text-white transition"
              >
                <ArrowLeft className="h-3 w-3" />
                <span>Return to login</span>
              </Link>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default ResetPassword;

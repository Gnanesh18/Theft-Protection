import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Shield, Mail, User, CheckCircle, ArrowLeft, AlertCircle } from 'lucide-react';

const ForgotPassword = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [resetUrl, setResetUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email) {
      return setError('Please enter both your name and email address.');
    }
    setError('');
    setSuccessMessage('');
    setResetUrl('');
    setSubmitting(true);

    try {
      const res = await axios.post('http://localhost:5001/api/auth/forgot-password', { email, name });
      if (res.data.success) {
        setSuccessMessage(res.data.message || 'Reset link dispatched.');
        if (res.data.resetUrl) {
          setResetUrl(res.data.resetUrl);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Server error. Password reset request failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full space-y-6 glass-card p-8 rounded-2xl shadow-glass border border-navy-border/70"
      >
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-navy-light/10 border border-navy-light/35 rounded-full flex items-center justify-center text-navy-light">
            <Shield className="h-6 w-6" />
          </div>
          <h2 className="mt-3 text-2xl font-bold font-sans">Reset Passcode</h2>
          <p className="mt-1.5 text-xs text-slate-light font-mono">CRITICAL PROFILE RECOVERY</p>
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
            <p className="text-sm font-semibold text-slate-200 font-sans">
              Password Reset Access Granted
            </p>
            <p className="text-xs text-slate-light leading-relaxed font-sans pb-2">
              {successMessage}
            </p>
            
            {resetUrl && (
              <div className="pb-4">
                <a
                  href={resetUrl}
                  className="inline-block px-6 py-2.5 bg-safety-amber text-black text-xs font-bold rounded-lg hover:bg-yellow-500 transition font-mono"
                >
                  Go to Password Reset
                </a>
              </div>
            )}

            <div className="pt-2 border-t border-navy-border/40">
              <Link
                to="/login"
                className="inline-flex items-center space-x-1 text-xs text-slate-light hover:text-white transition font-mono border-b border-dashed border-slate-gray"
              >
                <ArrowLeft className="h-3 w-3" />
                <span>RETURN TO ACCESS LOG</span>
              </Link>
            </div>
          </motion.div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <p className="text-xs text-slate-light leading-relaxed font-sans">
              Enter your registered profile name and email address below. The safety grid will verify your identity and generate a password reset link.
            </p>

            <div>
              <label className="block text-[10px] font-mono uppercase text-slate-light mb-1.5">REGISTERED FULL NAME</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-gray">
                  <User className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm glass-input font-sans"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase text-slate-light mb-1.5">PROFILE EMAIL ADDRESS</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-gray">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm glass-input font-mono"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-navy-light hover:bg-[#C5933E] text-sm font-bold rounded-lg text-black transition duration-200 shadow-[0_0_10px_rgba(217,167,82,0.25)]"
            >
              {submitting ? 'DISPATCHING RECOVERY DATA...' : 'SEND INSTRUCTIONS'}
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

export default ForgotPassword;
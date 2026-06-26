import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Shield, User, Phone, Award, CheckCircle, AlertCircle } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phoneNumber: user?.phoneNumber || '',
    badgeNumber: user?.badgeNumber || '',
    department: user?.department || ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name || !formData.phoneNumber) {
      return setError('Name and Phone Number are required.');
    }

    setSubmitting(true);
    const result = await updateProfile(formData);
    setSubmitting(false);

    if (result.success) {
      setSuccess('Profile details revised successfully.');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 flex-grow">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 md:p-8 rounded-2xl border border-navy-border/60 shadow-glass font-sans"
      >
        <div className="border-b border-navy-border/50 pb-4 mb-6 text-center sm:text-left">
          <h1 className="text-xl font-bold font-sans">Account Configuration</h1>
          <p className="text-xs text-slate-light mt-1">Review account identifiers and revise contact preferences.</p>
        </div>

        {error && (
          <div className="p-3 mb-6 bg-safety-crimson/10 border border-safety-crimson/30 rounded-lg text-xs text-safety-crimson flex items-center space-x-2 font-mono">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 mb-6 bg-safety-emerald/10 border border-safety-emerald/30 rounded-lg text-xs text-safety-emerald flex items-center space-x-2 font-sans">
            <CheckCircle className="h-4 w-4" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Read only metadata */}
          <div className="grid grid-cols-2 gap-4 bg-navy-dark/40 border border-navy-border/40 p-4 rounded-xl text-xs font-mono">
            <div>
              <span className="text-[9px] text-slate-gray block mb-0.5">REGISTERED EMAIL</span>
              <span className="text-slate-200 block truncate">{user?.email}</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-gray block mb-0.5">AUTHORITY ROLE</span>
              <span className="text-navy-light block uppercase font-bold">{user?.role}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-mono uppercase text-slate-light mb-1.5 font-mono">FULL NAME</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-gray font-sans">
                  <User className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm glass-input font-sans font-semibold"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase text-slate-light mb-1.5 font-mono">CONTACT PHONE</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-gray">
                  <Phone className="h-4 w-4" />
                </span>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm glass-input font-mono font-semibold"
                  required
                />
              </div>
            </div>
          </div>

          {/* Dynamic officer fields */}
          {user?.role === 'officer' && (
            <div className="border-t border-navy-border/50 pt-4 mt-4 space-y-4">
              <span className="text-[9px] font-mono font-bold text-safety-amber uppercase tracking-wider block">OFFICER ASSIGNMENT SPECIFICS</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-light mb-1.5">BADGE ID</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-gray">
                      <Award className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      name="badgeNumber"
                      value={formData.badgeNumber}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm glass-input font-mono bg-navy-dark/40 font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-light mb-1.5 font-mono">ASSIGNED DEPARTMENT</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-gray">
                      <Shield className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm glass-input font-sans bg-navy-dark/40 font-semibold"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 bg-navy-light hover:bg-[#C5933E] text-sm font-bold rounded-lg text-black transition duration-200 shadow-[0_0_10px_rgba(217,167,82,0.25)]"
          >
            {submitting ? 'REVISING DETAILS...' : 'SAVE CHANGES'}
          </button>
        </form>

      </motion.div>
    </div>
  );
};

export default Profile;
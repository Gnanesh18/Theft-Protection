import React from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#0B132B] border-t border-navy-border py-8 text-slate-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          
          <div className="flex items-center space-x-2 text-slate-light">
            <Shield className="h-5 w-5 text-safety-crimson/80" />
            <div className="text-left">
              <span className="font-semibold text-xs font-mono tracking-wider block text-slate-light">THEFT PROTECTION SYSTEM</span>
              <span className="text-[9px] text-[#64748B] block font-mono">Public Incident Reporting and Case Manager</span>
            </div>
          </div>

          <div className="flex flex-wrap justify-center space-x-6 text-xs font-medium">
            <Link to="/" className="hover:text-white transition">Home</Link>
            <Link to="/track-case" className="hover:text-white transition">Track Case</Link>
            <span className="text-[#2C4F72]">|</span>
            <Link to="/login/admin" className="hover:text-[#D9A752] transition">Admin Console</Link>
            <span className="text-[#2C4F72]">|</span>
            <span className="text-slate-light font-mono text-[10px]">MCA Project-Based Learning Demo</span>
          </div>

          <div className="text-center md:text-right text-[10px] text-[#64748B] font-mono leading-relaxed">
            <p>&copy; {new Date().getFullYear()} Smart Safety Portal. Developed for Public Safety Initiatives.</p>
            <p>Department of Information Technology & Law Enforcement.</p>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;

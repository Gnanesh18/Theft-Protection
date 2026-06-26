import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, ShieldCheck, ShieldAlert, ArrowRight, Lock } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();

  const portals = [
    {
      id: 'citizen',
      title: 'Citizen Portal',
      description: 'Report incidents, track active cases, and view secure status updates.',
      icon: Shield,
      colorClass: 'text-safety-emerald border-safety-emerald/20 hover:border-safety-emerald/45',
      glowClass: 'hover:shadow-neon-green bg-safety-emerald/5',
      badge: 'Public Access',
      badgeColor: 'bg-safety-emerald/10 text-safety-emerald border-safety-emerald/20',
      action: 'Enter Portal',
      path: '/login/citizen'
    },
    {
      id: 'officer',
      title: 'Officer Command',
      description: 'Manage investigation dossiers, log official updates, and process security briefs.',
      icon: ShieldCheck,
      colorClass: 'text-blue-400 border-blue-500/20 hover:border-blue-500/45',
      glowClass: 'hover:shadow-[0_0_15px_rgba(96,165,250,0.3)] bg-blue-500/5',
      badge: 'Authorized Personnel Only',
      badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      action: 'Access Command',
      path: '/login/officer'
    }
  ];

  return (
    <div className="flex-grow flex flex-col justify-center items-center py-16 px-4 sm:px-6 lg:px-8 relative grid-bg min-h-[calc(100vh-4rem)]">
      {/* Background Decorative Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-navy-light/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-4xl w-full text-center space-y-4 mb-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center space-x-2 px-3 py-1 bg-navy-medium border border-navy-border rounded-full text-[10px] font-mono tracking-widest text-slate-light uppercase"
        >
          <Lock className="h-3 w-3 text-navy-light" />
          <span>Secure Authentication Gate</span>
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl sm:text-4xl font-extrabold tracking-tight font-sans text-white"
        >
          Command Center Access Portal
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-md mx-auto text-xs sm:text-sm text-slate-light"
        >
          Identify your authorization status to access the appropriate dashboard.
        </motion.p>
      </div>

      <div className="max-w-3xl w-full grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        {portals.map((portal, idx) => {
          const Icon = portal.icon;
          return (
            <motion.div
              key={portal.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 + idx * 0.1 }}
              onClick={() => navigate(portal.path)}
              className={`glass-card rounded-2xl p-6 flex flex-col justify-between border cursor-pointer group transition-all duration-300 ${portal.colorClass} ${portal.glowClass}`}
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-navy-dark/60 rounded-xl border border-navy-border group-hover:border-current transition-colors">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className={`text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border ${portal.badgeColor}`}>
                    {portal.badge}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white font-sans group-hover:text-navy-light transition-colors">
                    {portal.title}
                  </h3>
                  <p className="text-xs text-slate-light leading-relaxed">
                    {portal.description}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-navy-border/50 flex items-center justify-between text-white">
                <span className="text-xs font-semibold font-mono tracking-wider text-slate-light group-hover:text-white transition-colors">
                  {portal.action}
                </span>
                <div className="h-7 w-7 rounded-full bg-navy-medium border border-navy-border flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Login;
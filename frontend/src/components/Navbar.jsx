import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Bell, LogOut, User as UserIcon, Menu, X, Check } from 'lucide-react';

const Navbar = () => {
  const { user, logout, notifications, markNotificationsAsRead } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const notifRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    // Close dropdown on click outside
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setNotifDropdownOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    if (user.role === 'citizen') return '/citizen';
    if (user.role === 'officer') return '/officer';
    if (user.role === 'admin') return '/admin';
    return '/';
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-navy-dark/85 backdrop-blur-md border-b border-navy-border shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo Brand */}
            <Link to="/" className="flex items-center space-x-2 text-white hover:text-amber-200 transition">
              <Shield className="h-7 w-7 text-navy-light animate-pulse" />
              <div className="leading-tight">
                <span className="font-bold font-sans tracking-wider text-sm sm:text-base block">THEFT PROTECTION</span>
                <span className="text-[10px] text-slate-light block font-mono">INTELLIGENT COMMAND</span>
              </div>
            </Link>
   
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/" className={`text-sm font-medium transition duration-200 ${location.pathname === '/' ? 'text-white border-b-2 border-navy-light pb-1' : 'text-slate-light hover:text-white'}`}>
                Home
              </Link>
   
              {user && (
                <>
                  <Link to={getDashboardLink()} className={`text-sm font-medium transition duration-200 ${location.pathname.startsWith('/citizen') || location.pathname.startsWith('/officer') || location.pathname.startsWith('/admin') ? 'text-white border-b-2 border-navy-light pb-1' : 'text-slate-light hover:text-white'}`}>
                    Dashboard
                  </Link>
                  {user.role === 'citizen' && (
                    <Link to="/citizen/report" className={`text-sm font-medium transition duration-200 ${location.pathname === '/citizen/report' ? 'text-white border-b-2 border-navy-light pb-1' : 'text-slate-light hover:text-white'}`}>
                      Report Theft
                    </Link>
                  )}
                  <Link to="/profile" className={`text-sm font-medium transition duration-200 ${location.pathname === '/profile' ? 'text-white border-b-2 border-navy-light pb-1' : 'text-slate-light hover:text-white'}`}>
                    My Profile
                  </Link>
                </>
              )}
   
              {!user && (
                <Link to="/track-case" className={`text-sm font-medium transition duration-200 ${location.pathname === '/track-case' ? 'text-white border-b-2 border-navy-light pb-1' : 'text-slate-light hover:text-white'}`}>
                  Track Case
                </Link>
              )}
            </div>
   
            {/* Action buttons (Right side) */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <>
                  {/* Notification Bell Dropdown */}
                  <div className="relative" ref={notifRef}>
                    <button
                      onClick={() => {
                        setNotifDropdownOpen(!notifDropdownOpen);
                        if (unreadCount > 0) markNotificationsAsRead();
                      }}
                      className="p-1.5 rounded-full text-slate-light hover:text-white hover:bg-navy-light/40 transition relative"
                      aria-label="Notifications"
                    >
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 h-4 w-4 bg-navy-light text-black text-[9px] font-bold rounded-full flex items-center justify-center animate-bounce">
                          {unreadCount}
                        </span>
                      )}
                    </button>
   
                    {/* Notification Dropdown Panel */}
                    {notifDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-80 rounded-lg shadow-lg py-1 border border-navy-border glass-card text-white z-50">
                        <div className="px-4 py-2 border-b border-navy-border flex justify-between items-center bg-navy-medium">
                          <span className="font-semibold text-xs font-mono">NOTIFICATIONS REPORT</span>
                          {unreadCount > 0 && (
                            <span className="text-[10px] text-safety-emerald flex items-center font-semibold">
                              <Check className="h-3 w-3 mr-0.5" /> Updated
                            </span>
                          )}
                        </div>
                        <div className="max-h-64 overflow-y-auto divide-y divide-navy-border">
                          {notifications.length === 0 ? (
                            <div className="px-4 py-6 text-center text-xs text-slate-light">
                              No notifications on record.
                            </div>
                          ) : (
                            notifications.map((notif) => (
                              <div key={notif._id} className={`p-3 text-xs transition duration-150 ${notif.isRead ? 'bg-transparent' : 'bg-navy-light/10'}`}>
                                <p className="font-medium text-slate-200">{notif.title}</p>
                                <p className="text-slate-light mt-0.5">{notif.message}</p>
                                <span className="text-[9px] text-[#64748B] block mt-1">
                                  {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(notif.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
  
                  {/* User Info & Logout */}
                  <div className="flex items-center space-x-3 pl-2 border-l border-navy-border">
                    <div className="text-right">
                      <span className="text-xs font-semibold block text-slate-200">{user.name}</span>
                      <span className="text-[10px] block capitalize font-mono text-navy-light">{user.role}</span>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-navy-medium flex items-center justify-center border border-navy-border">
                      <UserIcon className="h-4 w-4 text-navy-light" />
                    </div>
                    <button
                      onClick={handleLogout}
                      className="p-1.5 rounded-full text-slate-light hover:text-red-500 hover:bg-navy-light/10 transition"
                      title="Log Out"
                    >
                      <LogOut className="h-5 w-5" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link to="/login" className="px-4 py-2 rounded-md text-xs font-semibold text-slate-200 hover:text-white transition">
                    Login
                  </Link>
                  <Link to="/register" className="px-4 py-2 rounded-md text-xs font-semibold bg-navy-light hover:bg-[#C5933E] text-black transition shadow-[0_0_10px_rgba(217,167,82,0.25)]">
                    Report Theft
                  </Link>
                </div>
              )}
            </div>
   
            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-3">
              {user && unreadCount > 0 && (
                <button
                  onClick={() => {
                    setNotifDropdownOpen(!notifDropdownOpen);
                    navigate(getDashboardLink());
                  }}
                  className="p-1 text-slate-light relative"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-0 right-0 h-2 w-2 bg-navy-light rounded-full"></span>
                </button>
              )}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md text-slate-light hover:text-white hover:bg-navy-light/20 transition"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
   
          </div>
        </div>
   
        {/* Mobile Menu overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-navy-dark border-b border-navy-border px-4 pt-2 pb-4 space-y-2">
            <Link to="/" className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-navy-medium transition">
              Home
            </Link>
   
            {user ? (
              <>
                <Link to={getDashboardLink()} className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-navy-medium transition">
                  Dashboard
                </Link>
                {user.role === 'citizen' && (
                  <Link to="/citizen/report" className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-navy-medium transition">
                    Report Theft
                  </Link>
                )}
                <Link to="/profile" className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-navy-medium transition">
                  Profile
                </Link>
                <div className="border-t border-navy-border my-2 pt-2 flex items-center justify-between px-3">
                  <div>
                    <span className="text-xs font-semibold block">{user.name}</span>
                    <span className="text-[10px] text-navy-light block capitalize">{user.role}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-red-500/10 text-red-500 rounded-md text-xs font-semibold hover:bg-red-500/25 transition"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="pt-2 border-t border-navy-border flex flex-col space-y-2 px-3">
                <Link to="/track-case" className="block py-2 text-sm text-slate-light hover:text-white">
                  Track Case
                </Link>
                <Link to="/login" className="block text-center py-2 bg-navy-medium border border-navy-border rounded-md text-xs font-semibold text-white">
                  Login
                </Link>
                <Link to="/register" className="block text-center py-2 bg-navy-light text-black font-semibold rounded-md text-xs">
                  Report Theft
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div 
            className="max-w-md w-full bg-navy-dark border border-navy-border/80 rounded-2xl p-6 shadow-2xl relative"
            style={{ boxShadow: '0 0 30px rgba(239, 68, 68, 0.15)' }}
          >
            <div className="text-center space-y-4">
              <div className="mx-auto h-12 w-12 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 border border-red-500/25">
                <LogOut className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white font-sans">Terminate Session?</h3>
                <p className="text-xs text-slate-light leading-relaxed font-sans">
                  Are you sure you want to log out of your secure portal? You will need to re-authorize your credentials to access your dashboard.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="py-2.5 px-4 rounded-lg border border-navy-border text-slate-light hover:text-white hover:bg-navy-medium transition text-xs font-semibold"
                >
                  STAY LOGGED IN
                </button>
                <button
                  onClick={() => {
                    setShowLogoutModal(false);
                    logout();
                    navigate('/');
                  }}
                  className="py-2.5 px-4 rounded-lg bg-red-500 hover:bg-red-600 text-white transition text-xs font-bold shadow-md shadow-red-500/15"
                >
                  LOG OUT
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
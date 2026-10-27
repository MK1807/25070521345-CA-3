import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import ProfileModal from './ProfileModal';
import ElectricLogo from '../bits/ElectricLogo';

const navItems = [
  {
    path: '/',
    label: 'Dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    path: '/pomodoro',
    label: 'Focus Timer',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    path: '/kanban',
    label: 'Kanban Board',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
      </svg>
    ),
  },
  {
    path: '/habits',
    label: 'Habit Tracker',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    path: '/lounge',
    label: 'Sound Lounge',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
      </svg>
    ),
  },
  {
    path: '/journal',
    label: 'Notes & Journal',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    path: '/zen',
    label: 'Zen Mode',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    ),
  },
  {
    path: '/analytics',
    label: 'Analytics',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
];

const AVATAR_MAP = {
  orbit: '🪐',
  ember: '🔥',
  frost: '❄️',
  nova: '✨',
  lotus: '🌸',
  pulse: '⚡',
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const avatarEmoji = AVATAR_MAP[user?.avatar] || user?.name?.[0]?.toUpperCase() || '👤';

  const NavContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand Logo */}
      <div className="px-4 py-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          {/* ElectricLogo WebGL effect */}
          <div className="w-10 h-10 flex-shrink-0">
            <ElectricLogo
              color="#c4b5fd"
              glowColor="#8b5cf6"
              scale={0.72}
              strands={3}
              bend={0.5}
              crackle={1.2}
              arcs={1}
              speed={2}
              flicker={0.5}
              interactive={true}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">Pulse</h1>
            <p className="text-xs text-white/40 -mt-0.5">Productivity Studio</p>
          </div>
        </div>
      </div>

      {/* Nav Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-2xl transition-all duration-300 group text-sm ${
                isActive
                  ? 'bg-gradient-to-r from-violet-600/35 to-indigo-600/25 border border-violet-400/40 text-white font-semibold shadow-[0_0_20px_rgba(139,92,246,0.25)] backdrop-blur-md'
                  : 'text-white/50 hover:text-white hover:bg-white/[0.06] border border-transparent hover:border-white/10 backdrop-blur-sm font-medium'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`transition-colors ${isActive ? 'text-violet-400' : 'group-hover:text-violet-400'}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Section & Profile Button */}
      <div className="p-4 border-t border-white/5 space-y-2">
        <button
          onClick={() => setProfileOpen(true)}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 backdrop-blur-xl shadow-lg transition-all text-left group"
          title="Customize Profile & Theme"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500/30 to-violet-600/30 border border-white/10 flex items-center justify-center text-lg flex-shrink-0">
            {avatarEmoji}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate group-hover:text-violet-300 transition-colors">
              {user?.displayName || user?.name || 'Studio User'}
            </p>
            <p className="text-[10px] text-white/40 truncate">Theme & Profile ⚙️</p>
          </div>
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all text-xs font-medium"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-64 backdrop-blur-2xl bg-[#070617]/70 border-r border-white/10 shadow-[4px_0_32px_rgba(0,0,0,0.5)] z-40">
        <NavContent />
      </aside>

      {/* Mobile Top Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 backdrop-blur-2xl bg-[#070617]/80 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 flex-shrink-0">
            <ElectricLogo
              color="#c4b5fd"
              glowColor="#8b5cf6"
              scale={0.72}
              strands={3}
              bend={0.5}
              crackle={1.2}
              arcs={1}
              speed={2}
              flicker={0.5}
              interactive={false}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
          <span className="font-bold text-white text-sm">Pulse Studio</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setProfileOpen(true)}
            className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-sm border border-white/10"
          >
            {avatarEmoji}
          </button>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed left-0 top-0 h-full w-72 glass-dark border-r border-white/10 z-50"
            >
              <NavContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Profile & Theme Customization Modal */}
      <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
    </>
  );
};

export default Navbar;

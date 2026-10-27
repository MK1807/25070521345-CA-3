import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const AVATAR_OPTIONS = [
  { id: 'orbit', label: 'Orbit', icon: '🪐', color: '#8b5cf6' },
  { id: 'ember', label: 'Ember', icon: '🔥', color: '#f97316' },
  { id: 'frost', label: 'Frost', icon: '❄️', color: '#22d3ee' },
  { id: 'nova', label: 'Nova', icon: '✨', color: '#eab308' },
  { id: 'lotus', label: 'Lotus', icon: '🌸', color: '#ec4899' },
  { id: 'pulse', label: 'Pulse', icon: '⚡', color: '#10b981' },
];

const THEME_ACCENTS = [
  {
    id: 'cyan',
    name: 'Neon Cyan',
    hex: '#22d3ee',
    gradient: 'from-cyan-400 to-blue-500',
    border: 'border-cyan-400',
  },
  {
    id: 'purple',
    name: 'Cyberpunk Purple',
    hex: '#8b5cf6',
    gradient: 'from-violet-500 to-purple-600',
    border: 'border-violet-500',
  },
  {
    id: 'emerald',
    name: 'Emerald Green',
    hex: '#10b981',
    gradient: 'from-emerald-400 to-teal-500',
    border: 'border-emerald-400',
  },
  {
    id: 'sunset',
    name: 'Sunset Orange',
    hex: '#f97316',
    gradient: 'from-orange-400 to-amber-500',
    border: 'border-orange-400',
  },
];

export default function ProfileModal({ isOpen, onClose }) {
  const { user, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();

  const [displayName, setDisplayName] = useState(user?.displayName || user?.name || '');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || 'orbit');
  const [selectedTheme, setSelectedTheme] = useState(user?.themeAccent || theme || 'purple');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.patch('/profile', {
        displayName: displayName.trim(),
        avatar: selectedAvatar,
        themeAccent: selectedTheme,
      });

      if (data?.user) {
        updateUser(data.user);
        if (setTheme) setTheme(data.user.themeAccent);
      }
      toast.success('Profile & theme customization saved to MongoDB! ✨');
      onClose();
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-dark rounded-3xl p-6 md:p-8 w-full max-w-lg border border-white/20 shadow-2xl relative"
      >
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="text-2xl">👤</span>
            <div>
              <h2 className="text-xl font-bold text-white">Profile & Customization</h2>
              <p className="text-xs text-white/40">Stored directly in your MongoDB account</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white text-lg p-1"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Display Name */}
          <div>
            <label className="text-xs font-semibold text-white/60 block mb-2">
              Personal Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g., Focus Ninja"
              className="input-field"
              maxLength={40}
            />
          </div>

          {/* Avatar Selector */}
          <div>
            <label className="text-xs font-semibold text-white/60 block mb-2">
              Choose Focus Avatar
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
              {AVATAR_OPTIONS.map((av) => (
                <button
                  key={av.id}
                  type="button"
                  onClick={() => setSelectedAvatar(av.id)}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
                    selectedAvatar === av.id
                      ? 'bg-white/15 border-white ring-2 ring-white/30 shadow-lg scale-105'
                      : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                  }`}
                >
                  <span className="text-2xl mb-1">{av.icon}</span>
                  <span className="text-[10px] text-white/70 font-medium">{av.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Theme Accent Switcher */}
          <div>
            <label className="text-xs font-semibold text-white/60 block mb-2">
              Theme Accent Color
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {THEME_ACCENTS.map((th) => (
                <button
                  key={th.id}
                  type="button"
                  onClick={() => setSelectedTheme(th.id)}
                  className={`flex items-center gap-2.5 p-3 rounded-2xl border transition-all ${
                    selectedTheme === th.id
                      ? `bg-white/15 ${th.border} ring-2 ring-white/20 shadow-md`
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0 shadow-sm"
                    style={{ backgroundColor: th.hex }}
                  />
                  <span className="text-xs text-white/80 font-medium truncate">
                    {th.name.split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-3">
            <button type="button" onClick={onClose} className="btn-ghost flex-1 text-sm">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex-1 text-sm flex items-center justify-center gap-2"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { ambientEngine } from '../services/ambientAudio';

const TRACK_DEFS = [
  {
    id: 'lofi',
    name: 'Lo-Fi Beats',
    subtitle: 'Chilled chords & gentle rhythm',
    icon: '🎧',
    color: '#8b5cf6',
    glow: 'rgba(139, 92, 246, 0.4)',
    accentGradient: 'from-violet-600/30 to-purple-900/40',
  },
  {
    id: 'rain',
    name: 'Rainy Haven',
    subtitle: 'Gentle raindrops on glass',
    icon: '🌧️',
    color: '#06b6d4',
    glow: 'rgba(6, 182, 212, 0.4)',
    accentGradient: 'from-cyan-600/30 to-blue-900/40',
  },
  {
    id: 'cafe',
    name: 'Cafe Murmur',
    subtitle: 'Warm coffee shop background',
    icon: '☕',
    color: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.4)',
    accentGradient: 'from-amber-600/30 to-orange-900/40',
  },
  {
    id: 'white',
    name: 'Deep White Noise',
    subtitle: 'Soft broadband focus blanket',
    icon: '🌊',
    color: '#10b981',
    glow: 'rgba(16, 185, 129, 0.4)',
    accentGradient: 'from-emerald-600/30 to-teal-900/40',
  },
];

export default function SoundLounge() {
  const { user } = useAuth();
  const [volumes, setVolumes] = useState({
    lofi: 0,
    rain: 0,
    cafe: 0,
    white: 0,
  });
  const [activeTrack, setActiveTrack] = useState('lofi');
  const [presets, setPresets] = useState([]);
  const [newPresetName, setNewPresetName] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const canvasRef = useRef(null);

  // Sync user's saved presets
  useEffect(() => {
    if (user?.audioPresets) {
      setPresets(user.audioPresets);
    }
  }, [user]);

  // Audio Visualizer loop
  useEffect(() => {
    let animationId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dataArray = new Uint8Array(32);

    const renderVisualizer = () => {
      animationId = requestAnimationFrame(renderVisualizer);
      ambientEngine.getVisualizerData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / 32) * 1.5;
      let x = 0;

      const currentDef = TRACK_DEFS.find((t) => t.id === activeTrack) || TRACK_DEFS[0];

      for (let i = 0; i < 32; i++) {
        const val = dataArray[i] || 0;
        const barHeight = (val / 255) * canvas.height * 0.85;

        const grad = ctx.createLinearGradient(0, canvas.height, 0, 0);
        grad.addColorStop(0, `${currentDef.color}22`);
        grad.addColorStop(1, currentDef.color);

        ctx.fillStyle = grad;
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight);
        x += barWidth;
      }
    };

    renderVisualizer();
    return () => cancelAnimationFrame(animationId);
  }, [activeTrack]);

  const handleVolumeChange = (trackId, val) => {
    const num = parseFloat(val);
    setVolumes((prev) => ({ ...prev, [trackId]: num }));
    ambientEngine.setVolume(trackId, num);
    if (num > 0) setActiveTrack(trackId);
  };

  const handleToggleTrack = (trackId) => {
    const current = volumes[trackId];
    const next = current > 0 ? 0 : 0.6;
    handleVolumeChange(trackId, next);
  };

  const handleMuteAll = () => {
    ambientEngine.stopAll();
    setVolumes({ lofi: 0, rain: 0, cafe: 0, white: 0 });
    toast.success('Muted all tracks');
  };

  const handleSavePreset = async () => {
    if (!newPresetName.trim()) {
      return toast.error('Enter a name for your mix');
    }
    try {
      const { data } = await api.post('/profile/presets', {
        name: newPresetName.trim(),
        volumes,
      });
      setPresets(data.audioPresets || []);
      setNewPresetName('');
      setShowSaveModal(false);
      toast.success('Mix preset saved to MongoDB!');
    } catch {
      toast.error('Failed to save preset');
    }
  };

  const handleApplyPreset = (preset) => {
    const v = {
      lofi: preset.volumes?.lofi ?? 0,
      rain: preset.volumes?.rain ?? 0,
      cafe: preset.volumes?.cafe ?? 0,
      white: preset.volumes?.white ?? 0,
    };
    setVolumes(v);
    Object.entries(v).forEach(([k, val]) => ambientEngine.setVolume(k, val));
    toast.success(`Loaded preset "${preset.name}"`);
  };

  const handleDeletePreset = async (presetId) => {
    try {
      const { data } = await api.delete(`/profile/presets/${presetId}`);
      setPresets(data.audioPresets || []);
      toast.success('Preset deleted');
    } catch {
      toast.error('Failed to delete preset');
    }
  };

  const currentTheme = TRACK_DEFS.find((t) => t.id === activeTrack) || TRACK_DEFS[0];
  const isAnyPlaying = Object.values(volumes).some((v) => v > 0);

  return (
    <div className="relative min-h-screen p-6 md:p-10 transition-colors duration-700 overflow-hidden">
      {/* Dynamic Ambient Background Glow */}
      <div
        className="pointer-events-none fixed inset-0 opacity-40 transition-all duration-1000"
        style={{
          background: `radial-gradient(circle at 60% 30%, ${currentTheme.glow} 0%, transparent 70%)`,
        }}
      />
      <div className="pointer-events-none fixed bottom-10 left-10 w-96 h-96 rounded-full blur-3xl opacity-20 bg-indigo-500" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-3xl">🎛️</span>
              <h1 className="text-3xl font-extrabold gradient-text">Ambient Sound Lounge</h1>
            </div>
            <p className="text-white/40 text-sm mt-1">
              Layer multi-sensory audio atmospheres with real-time frequency synthesis
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isAnyPlaying && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleMuteAll}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 text-white/70 hover:text-red-400 hover:border-red-500/30 transition-all"
              >
                Mute All
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSaveModal(true)}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <span>💾</span> Save Mix Preset
            </motion.button>
          </div>
        </div>

        {/* Real-time Spectrum Visualizer Card */}
        <div className="glass-dark rounded-3xl p-6 mb-8 border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div
                className={`w-2.5 h-2.5 rounded-full ${isAnyPlaying ? 'animate-ping' : ''}`}
                style={{ backgroundColor: currentTheme.color }}
              />
              <span className="text-xs uppercase tracking-widest font-semibold text-white/50">
                Live Frequency Spectrum
              </span>
            </div>
            <span
              className="text-xs font-mono px-3 py-1 rounded-full border border-white/10"
              style={{ color: currentTheme.color }}
            >
              Master Output: {Math.round(Math.max(...Object.values(volumes)) * 100)}%
            </span>
          </div>

          <div className="w-full h-24 flex items-end justify-center rounded-2xl bg-black/40 border border-white/5 px-4 overflow-hidden">
            <canvas ref={canvasRef} width={400} height={96} className="w-full h-full" />
          </div>
        </div>

        {/* Track Control Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {TRACK_DEFS.map((track) => {
            const vol = volumes[track.id];
            const isPlaying = vol > 0;

            return (
              <motion.div
                key={track.id}
                whileHover={{ y: -4 }}
                onClick={() => setActiveTrack(track.id)}
                className={`cursor-pointer rounded-3xl p-6 transition-all duration-300 border relative overflow-hidden ${
                  activeTrack === track.id
                    ? 'glass-dark border-white/30 shadow-xl'
                    : 'glass-dark border-white/10 hover:border-white/20'
                }`}
                style={{
                  boxShadow: isPlaying ? `0 0 25px ${track.glow}` : 'none',
                }}
              >
                {/* Glow accent pill */}
                <div
                  className="absolute -top-12 -right-12 w-28 h-28 rounded-full blur-2xl opacity-40 transition-opacity"
                  style={{ backgroundColor: track.color }}
                />

                <div className="flex items-start justify-between mb-5">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-all"
                    style={{
                      backgroundColor: isPlaying ? `${track.color}25` : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${isPlaying ? track.color : 'rgba(255,255,255,0.1)'}`,
                    }}
                  >
                    {track.icon}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleTrack(track.id);
                    }}
                    className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                    style={{
                      backgroundColor: isPlaying ? track.color : 'rgba(255,255,255,0.1)',
                      color: isPlaying ? '#000' : '#fff',
                      boxShadow: isPlaying ? `0 0 10px ${track.color}` : 'none',
                    }}
                  >
                    {isPlaying ? 'Active' : 'Muted'}
                  </button>
                </div>

                <h3 className="text-lg font-bold text-white mb-1">{track.name}</h3>
                <p className="text-xs text-white/40 mb-6">{track.subtitle}</p>

                {/* Volume Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-white/40">Volume</span>
                    <span style={{ color: track.color }}>{Math.round(vol * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={vol}
                    onChange={(e) => handleVolumeChange(track.id, e.target.value)}
                    className="w-full accent-violet-500 cursor-pointer h-2 bg-white/10 rounded-lg appearance-none"
                    style={{ accentColor: track.color }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Saved Mixer Presets (MongoDB Synced) */}
        <div className="glass-dark rounded-3xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>🎧</span> Saved Sound Presets
            </h2>
            <span className="text-xs text-white/40">Synced with your MongoDB Profile</span>
          </div>

          {presets.length === 0 ? (
            <p className="text-sm text-white/40 py-4">
              No custom presets saved yet. Adjust volumes above and click &quot;Save Mix Preset&quot; to store your favorite study ambiance in the database.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {presets.map((preset) => (
                <div
                  key={preset._id}
                  className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between hover:border-white/20 transition-all"
                >
                  <div className="cursor-pointer flex-1 mr-3" onClick={() => handleApplyPreset(preset)}>
                    <h4 className="text-sm font-semibold text-white">{preset.name}</h4>
                    <p className="text-xs text-white/40 mt-0.5">
                      LoFi {Math.round((preset.volumes?.lofi || 0) * 100)}% • Rain{' '}
                      {Math.round((preset.volumes?.rain || 0) * 100)}%
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApplyPreset(preset)}
                      className="px-3 py-1 rounded-xl bg-violet-600/30 border border-violet-500/40 text-violet-300 text-xs hover:bg-violet-600/50"
                    >
                      Load
                    </button>
                    <button
                      onClick={() => handleDeletePreset(preset._id)}
                      className="text-white/30 hover:text-red-400 p-1 text-sm"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Save Preset Modal */}
      <AnimatePresence>
        {showSaveModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
            onClick={() => setShowSaveModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-dark rounded-3xl p-6 w-full max-w-md border border-white/20"
            >
              <h3 className="text-xl font-bold text-white mb-2">Save Ambient Preset</h3>
              <p className="text-xs text-white/40 mb-4">
                Store current track volumes to your MongoDB user profile.
              </p>

              <input
                type="text"
                placeholder="e.g., Deep Focus Rain & Lo-Fi"
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                className="input-field mb-5"
                autoFocus
              />

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowSaveModal(false)}
                  className="btn-ghost flex-1 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSavePreset}
                  className="btn-primary flex-1 text-sm"
                >
                  Save Preset
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

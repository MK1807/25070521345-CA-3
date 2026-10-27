import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import toast from 'react-hot-toast';
import CrystalizedBall from '../bits/CrystalizedBall';
import { ambientEngine } from '../services/ambientAudio';
import { useTheme } from '../context/ThemeContext';

const MODES = {
  pomodoro: {
    label: 'Focus',
    duration: 25 * 60,
    color: '#8B5CF6',
    preset: 'plasma',
    gradient: 'from-violet-600 to-indigo-600',
    glow: 'rgba(139, 92, 246, 0.4)',
  },
  short_break: {
    label: 'Short Break',
    duration: 5 * 60,
    color: '#06B6D4',
    preset: 'aurora',
    gradient: 'from-cyan-600 to-teal-600',
    glow: 'rgba(6, 182, 212, 0.4)',
  },
  long_break: {
    label: 'Long Break',
    duration: 15 * 60,
    color: '#EC4899',
    preset: 'nebula',
    gradient: 'from-pink-600 to-rose-600',
    glow: 'rgba(236, 72, 153, 0.4)',
  },
};

const AMBIENT_LABELS = {
  none:  { label: 'Off',         emoji: '🔇' },
  rain:  { label: 'Rain',        emoji: '🌧️', trackId: 'rain' },
  cafe:  { label: 'Café',        emoji: '☕', trackId: 'cafe' },
  white: { label: 'White Noise', emoji: '🌊', trackId: 'white' },
  lofi:  { label: 'Lo-Fi',       emoji: '🎧', trackId: 'lofi' },
};

const RING_RADIUS = 162;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const Pomodoro = () => {
  const { vars } = useTheme();
  const [mode, setMode]         = useState('pomodoro');
  const [timeLeft, setTimeLeft] = useState(MODES.pomodoro.duration);
  const [running, setRunning]   = useState(false);
  const [sessions, setSessions] = useState(0);
  const [ambient, setAmbient]   = useState('none');
  const [logging, setLogging]   = useState(false);
  const intervalRef = useRef(null);
  const totalDuration = MODES[mode].duration;

  // Active mode configuration & theme integration
  const cfg = MODES[mode];
  const activeColor = mode === 'pomodoro' && vars?.primary ? vars.primary : cfg.color;

  // Switch mode
  const switchMode = (newMode) => {
    setRunning(false);
    clearInterval(intervalRef.current);
    setMode(newMode);
    setTimeLeft(MODES[newMode].duration);
  };

  // Adjust time by minutes (+/-)
  const adjustTime = (deltaMinutes) => {
    setTimeLeft((prev) => {
      const next = prev + deltaMinutes * 60;
      return Math.max(60, Math.min(next, 120 * 60));
    });
  };

  // Timer tick
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            handleSessionComplete();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, mode]);

  // Ambient sound synthesizer handler
  useEffect(() => {
    if (ambient === 'none') {
      ambientEngine.stopAll();
    } else {
      ambientEngine.ensureRunning();
      const targetId = AMBIENT_LABELS[ambient]?.trackId;
      ['lofi', 'rain', 'cafe', 'white'].forEach((t) => {
        ambientEngine.setVolume(t, t === targetId ? 0.65 : 0);
      });
    }
    return () => {
      ambientEngine.stopAll();
    };
  }, [ambient]);

  const handleSessionComplete = useCallback(async () => {
    const completedMode = mode;
    const mins = Math.round(MODES[completedMode].duration / 60);
    toast.success(`${MODES[completedMode].label} session complete! 🎉`, { duration: 4000 });

    if (completedMode === 'pomodoro') {
      setSessions((s) => s + 1);
      setLogging(true);
      try {
        await api.post('/focus', { duration: mins, type: 'pomodoro' });
      } catch {}
      finally { setLogging(false); }
    }
    // Auto-switch to break or back to focus
    if (completedMode === 'pomodoro') {
      setTimeout(() => switchMode('short_break'), 500);
    } else {
      setTimeout(() => switchMode('pomodoro'), 500);
    }
  }, [mode]);

  const reset = () => {
    setRunning(false);
    clearInterval(intervalRef.current);
    setTimeLeft(MODES[mode].duration);
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const progress = Math.max(0, Math.min(1, (totalDuration - timeLeft) / totalDuration));
  const strokeDashoffset = RING_CIRCUMFERENCE * (1 - progress);
  // Fill calculates fluid energy inside the ball (from full to lower level as time passes)
  const ballFill = Math.max(0.15, Math.min(0.92, timeLeft / totalDuration));

  return (
    <div className="min-h-screen bg-[#070714] flex flex-col items-center justify-center px-4 py-8 pt-20 lg:pt-10 relative overflow-hidden">
      {/* Ambient background glows */}
      <div
        className="pointer-events-none absolute w-[550px] h-[550px] rounded-full opacity-15 blur-[120px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-colors duration-1000"
        style={{ background: activeColor }}
      />
      <div className="pointer-events-none absolute w-72 h-72 rounded-full bg-indigo-900/10 blur-[90px] top-4 left-4" />
      <div className="pointer-events-none absolute w-72 h-72 rounded-full bg-pink-900/10 blur-[90px] bottom-4 right-4" />

      <div className="relative z-10 w-full max-w-lg space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/60 mb-2">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: activeColor }} />
            <span>Interactive WebGL Focus Sphere</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight gradient-text">Focus Timer</h1>
          <p className="text-white/40 text-xs sm:text-sm mt-1">Deep work powered by the Pomodoro technique</p>
        </motion.div>

        {/* Mode Switcher */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="glass flex p-1.5 rounded-2xl gap-1.5"
        >
          {Object.entries(MODES).map(([key, val]) => {
            const isCurrent = mode === key;
            return (
              <button
                key={key}
                onClick={() => switchMode(key)}
                className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-200 ${
                  isCurrent
                    ? `bg-gradient-to-r ${val.gradient} text-white shadow-lg`
                    : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
                style={isCurrent ? { boxShadow: `0 4px 18px ${val.glow}` } : {}}
              >
                {val.label}
              </button>
            );
          })}
        </motion.div>

        {/* Crystalized Ball Timer Hero */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-center"
        >
          <div className="relative w-[340px] h-[340px] sm:w-[380px] sm:h-[380px] flex items-center justify-center">
            {/* The React Bits CrystalizedBall WebGL Component */}
            <div className="absolute inset-0 rounded-full overflow-hidden cursor-pointer" title="Click or hover to stir the energy ball">
              <CrystalizedBall
                key={mode}
                preset={cfg.preset}
                color={activeColor}
                size={0.84}
                crackle={running ? 0.85 : 0.4}
                fill={ballFill}
                interactive={true}
                hoverStrength={0.75}
                speed={running ? 1.15 : 0.45}
                dustSpeed={running ? 1.0 : 0.4}
                glow={running ? 0.95 : 0.65}
                flares={running ? 0.7 : 0.35}
                sparks={running ? 0.65 : 0.25}
              />
            </div>

            {/* Glowing outer progress hairline ring */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-[0_0_12px_rgba(0,0,0,0.8)]"
              viewBox="0 0 380 380"
            >
              {/* Subtle background rail */}
              <circle
                cx="190"
                cy="190"
                r={RING_RADIUS}
                fill="none"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="3"
              />
              {/* Dynamic countdown progress arc */}
              <motion.circle
                cx="190"
                cy="190"
                r={RING_RADIUS}
                fill="none"
                stroke={activeColor}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={RING_CIRCUMFERENCE}
                strokeDashoffset={strokeDashoffset}
                transform="rotate(-90 190 190)"
                transition={{ duration: 0.5, ease: 'linear' }}
                style={{
                  filter: `drop-shadow(0 0 10px ${activeColor})`,
                }}
              />
            </svg>

            {/* Center HUD timer readout */}
            <div className="relative z-10 pointer-events-none flex flex-col items-center justify-center select-none px-6 py-4 rounded-3xl bg-black/40 backdrop-blur-[6px] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.7)]">
              <span
                className="text-[10px] sm:text-xs uppercase tracking-widest font-bold px-3 py-1 rounded-full mb-1 border"
                style={{
                  borderColor: `${activeColor}40`,
                  backgroundColor: `${activeColor}15`,
                  color: activeColor,
                }}
              >
                {cfg.label}
              </span>

              <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
                {formatTime(timeLeft)}
              </span>

              <div className="flex items-center gap-1.5 mt-1.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${running ? 'animate-ping' : ''}`}
                  style={{ backgroundColor: activeColor }}
                />
                <span className="text-[11px] font-mono text-white/60">
                  {Math.round(progress * 100)}% complete
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick minute adjusters */}
        <div className="flex items-center justify-center gap-2 text-xs">
          <button
            onClick={() => adjustTime(-5)}
            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white border border-white/10 transition-colors font-mono"
            title="Subtract 5 minutes"
          >
            -5m
          </button>
          <button
            onClick={() => adjustTime(-1)}
            className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white border border-white/10 transition-colors font-mono"
            title="Subtract 1 minute"
          >
            -1m
          </button>
          <span className="text-white/30 text-[11px] px-2 font-mono">ADJUST TIME</span>
          <button
            onClick={() => adjustTime(1)}
            className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white border border-white/10 transition-colors font-mono"
            title="Add 1 minute"
          >
            +1m
          </button>
          <button
            onClick={() => adjustTime(5)}
            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white border border-white/10 transition-colors font-mono"
            title="Add 5 minutes"
          >
            +5m
          </button>
        </div>

        {/* Main Controls (Reset, Play/Pause, Skip) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-5"
        >
          <button
            onClick={reset}
            className="btn-ghost w-12 h-12 rounded-full flex items-center justify-center p-0 hover:bg-white/10 transition-colors border border-white/10"
            title="Reset Timer"
          >
            <svg className="w-5 h-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => setRunning(!running)}
            className={`w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-lg
              bg-gradient-to-br ${cfg.gradient} shadow-2xl transition-all duration-300`}
            style={{ boxShadow: `0 0 35px ${activeColor}55` }}
            title={running ? 'Pause' : 'Start Focus'}
          >
            <AnimatePresence mode="wait">
              {running ? (
                <motion.svg
                  key="pause"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="w-8 h-8"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </motion.svg>
              ) : (
                <motion.svg
                  key="play"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="w-8 h-8 ml-1"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </motion.svg>
              )}
            </AnimatePresence>
          </motion.button>

          <button
            onClick={() => switchMode(mode === 'pomodoro' ? 'short_break' : 'pomodoro')}
            className="btn-ghost w-12 h-12 rounded-full flex items-center justify-center p-0 hover:bg-white/10 transition-colors border border-white/10"
            title="Next Session"
          >
            <svg className="w-5 h-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        </motion.div>

        {/* Sessions Counter & Procedural Ambient Sound Controls */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 gap-4"
        >
          {/* Session count */}
          <div className="glass p-4 text-center rounded-2xl flex flex-col justify-between">
            <div>
              <div className="text-3xl font-extrabold gradient-text">{sessions}</div>
              <div className="text-xs text-white/50 mt-1 font-medium">Sessions Today</div>
            </div>
            <div className="flex justify-center gap-1.5 mt-3">
              {Array.from({ length: Math.max(4, sessions) }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    i < sessions ? 'bg-violet-400 shadow-[0_0_8px_#a78bfa]' : 'bg-white/10'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Ambient sound generator */}
          <div className="glass p-4 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-white/50 font-medium uppercase tracking-wider">Ambient Audio</span>
              {ambient !== 'none' && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono animate-pulse">
                  PLAYING
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(AMBIENT_LABELS).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => setAmbient(key)}
                  className={`text-xs px-2 py-1.5 rounded-lg transition-all duration-200 font-medium ${
                    ambient === key
                      ? 'bg-violet-600/50 border border-violet-400/60 text-white shadow-[0_0_12px_rgba(139,92,246,0.4)]'
                      : 'bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10'
                  }`}
                  title={`${val.label} procedural synthesizer`}
                >
                  {val.emoji}
                </button>
              ))}
            </div>
            {ambient !== 'none' && (
              <p className="text-[10px] text-white/40 mt-2 font-mono">
                🎧 {AMBIENT_LABELS[ambient].label} (Web Audio Synthesizer)
              </p>
            )}
          </div>
        </motion.div>

        {/* Focus guidance tip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="glass p-3.5 rounded-2xl text-center"
        >
          <p className="text-white/40 text-xs">
            💡 <strong className="text-white/70">Tip:</strong> Hover or click directly on the Crystalized Ball to interact with its electric strands and particle vortex.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Pomodoro;

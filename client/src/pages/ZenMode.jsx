import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Aurora from '../bits/Aurora';

const AMBIENT_THEMES = [
  { id: 'abyss', name: 'Deep Abyss', color: '#38bdf8', accent: '#0369a1', bg: '#030712' },
  { id: 'violet', name: 'Cyber Violet', color: '#c084fc', accent: '#7e22ce', bg: '#090514' },
  { id: 'emerald', name: 'Emerald Calm', color: '#34d399', accent: '#047857', bg: '#021810' },
  { id: 'sunset', name: 'Solar Warmth', color: '#fb923c', accent: '#c2410c', bg: '#180a02' },
];

export default function ZenMode() {
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [activeTaskIndex, setActiveTaskIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [themeIndex, setThemeIndex] = useState(0);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [focusSeconds, setFocusSeconds] = useState(25 * 60);

  // Digital clock tick
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Zen focus timer countdown
  useEffect(() => {
    if (isTimerPaused || focusSeconds <= 0) return;
    const interval = setInterval(() => {
      setFocusSeconds((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerPaused, focusSeconds]);

  // Load incomplete tasks from MongoDB
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const { data } = await api.get('/tasks');
        const incomplete = (data || []).filter((t) => !t.completed);
        setTasks(incomplete);
      } catch {
        // Fallback gracefully
      }
    };
    fetchTasks();
  }, []);

  // Toggle true browser full-screen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    }
  };

  const handleMarkTaskDone = async (task) => {
    if (!task) return;
    try {
      await api.patch(`/tasks/${task._id}`, { status: 'completed', completed: true });
      toast.success('Task finished! ✨');
      setTasks((prev) => prev.filter((t) => t._id !== task._id));
      setActiveTaskIndex(0);
    } catch {
      toast.error('Failed to update task');
    }
  };

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const activeTheme = AMBIENT_THEMES[themeIndex];
  const activeTask = tasks[activeTaskIndex] || null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-between p-8 md:p-14 select-none overflow-hidden transition-colors duration-1000"
      style={{ backgroundColor: activeTheme.bg }}
    >
      {/* Aurora WebGL Background from React Bits */}
      <div className="absolute inset-0 opacity-60 pointer-events-none">
        <Aurora
          colorStops={
            activeTheme.id === 'abyss'   ? ['#0369a1', '#38bdf8', '#0369a1'] :
            activeTheme.id === 'violet'  ? ['#7e22ce', '#c084fc', '#7e22ce'] :
            activeTheme.id === 'emerald' ? ['#047857', '#34d399', '#047857'] :
                                           ['#c2410c', '#fb923c', '#c2410c']
          }
          direction="bottom"
          amplitude={1.2}
          blend={0.5}
          speed={0.8}
        />
      </div>

      {/* Top Floating Controls */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-5xl flex items-center justify-between"
      >
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10 text-xs font-semibold backdrop-blur-md transition-all"
        >
          <span>✕</span> Exit Zen Mode
        </button>

        <div className="flex items-center gap-2">
          {/* Theme Palette Switcher */}
          <button
            onClick={() => setThemeIndex((prev) => (prev + 1) % AMBIENT_THEMES.length)}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 text-xs font-medium backdrop-blur-md transition-all"
          >
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: activeTheme.color }}
            />
            <span>{activeTheme.name}</span>
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 text-xs backdrop-blur-md transition-all"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? '⤢' : '⤡'}
          </button>
        </div>
      </motion.div>

      {/* Centerpiece: Ultra-Sleek Clock & Focus Timer */}
      <div className="relative z-10 flex flex-col items-center text-center my-auto">
        {/* Sleek Digital Time */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="text-7xl md:text-9xl font-extralight tracking-tighter text-white/95 font-mono drop-shadow-2xl mb-4"
        >
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </motion.div>

        {/* Date string */}
        <p className="text-sm md:text-base text-white/40 font-light tracking-widest uppercase mb-8">
          {time.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>

        {/* Zen Focus Countdown & Pause Control */}
        <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-full px-6 py-2.5 backdrop-blur-xl mb-12 shadow-2xl">
          <span className="text-xl font-mono font-medium" style={{ color: activeTheme.color }}>
            {formatTimer(focusSeconds)}
          </span>
          <button
            onClick={() => setIsTimerPaused(!isTimerPaused)}
            className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition-all"
          >
            {isTimerPaused ? 'Resume ▶' : 'Pause ⏸'}
          </button>
          <button
            onClick={() => setFocusSeconds(25 * 60)}
            className="text-xs text-white/40 hover:text-white transition-colors"
          >
            ↺ Reset
          </button>
        </div>

        {/* Current Active Single Task Card */}
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait">
            {activeTask ? (
              <motion.div
                key={activeTask._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="glass-dark rounded-3xl p-6 border border-white/15 backdrop-blur-2xl shadow-2xl relative"
                style={{
                  boxShadow: `0 0 35px ${activeTheme.color}20`,
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] tracking-widest font-mono uppercase text-white/40">
                    Current Focus Task
                  </span>
                  {tasks.length > 1 && (
                    <button
                      onClick={() =>
                        setActiveTaskIndex((prev) => (prev + 1) % tasks.length)
                      }
                      className="text-xs text-white/40 hover:text-white transition-colors"
                    >
                      Next task ({activeTaskIndex + 1}/{tasks.length}) →
                    </button>
                  )}
                </div>

                <h3 className="text-lg md:text-xl font-medium text-white mb-4">
                  {activeTask.title}
                </h3>

                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <span className="text-xs font-mono text-white/30">
                    {activeTask.priority?.toUpperCase()} PRIORITY
                  </span>
                  <button
                    onClick={() => handleMarkTaskDone(activeTask)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-black transition-all hover:scale-105"
                    style={{ backgroundColor: activeTheme.color }}
                  >
                    ✓ Complete Task
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="glass-dark rounded-3xl p-6 border border-white/10 text-center text-white/40 text-sm">
                No active task selected. Pure mind, zero clutter.
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom Subtle Hint */}
      <div className="relative z-10 text-center text-[11px] text-white/20 font-mono tracking-widest">
        ZEN STUDIO • DISTRACTION-FREE SPACE
      </div>
    </div>
  );
}

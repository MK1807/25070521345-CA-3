import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import LineWaves from '../bits/LineWaves';

const QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { text: "It's not that I'm so smart, it's just that I stay with problems longer.", author: "Albert Einstein" },
  { text: "Your future is created by what you do today, not tomorrow.", author: "Robert T. Kiyosaki" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Do the hard jobs first. The easy jobs will take care of themselves.", author: "Dale Carnegie" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "Discipline is the bridge between goals and accomplishment.", author: "Jim Rohn" },
  { text: "Small daily improvements are the key to staggering long-term results.", author: "Robin Sharma" },
  { text: "The key is not to prioritize what's on your schedule, but to schedule your priorities.", author: "Stephen Covey" },
];

const PRIORITY_CONFIG = {
  high:   { color: 'text-red-400',    dot: 'bg-red-400',    label: 'High' },
  medium: { color: 'text-yellow-400', dot: 'bg-yellow-400', label: 'Med' },
  low:    { color: 'text-green-400',  dot: 'bg-green-400',  label: 'Low' },
};

// Animated Clock Component
const Clock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours   = String(time.getHours()).padStart(2, '0');
  const minutes = String(time.getMinutes()).padStart(2, '0');
  const seconds = String(time.getSeconds()).padStart(2, '0');
  const dateStr = time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="text-center select-none">
      <div className="font-mono font-bold tracking-tight leading-none" style={{ fontSize: 'clamp(3rem, 7vw, 4.8rem)' }}>
        <span className="gradient-text">{hours}</span>
        <motion.span
          animate={{ opacity: [1, 0.2, 1] }}
          transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
          className="text-white/30 mx-1"
        >
          :
        </motion.span>
        <span className="gradient-text">{minutes}</span>
        <span className="text-white/25 text-3xl sm:text-4xl ml-2 font-light">{seconds}</span>
      </div>
      <p className="text-white/50 text-xs sm:text-sm mt-3 font-medium tracking-wide">{dateStr}</p>
    </div>
  );
};

// Motivational Quote Component
const QuoteCard = () => {
  const [quoteIdx, setQuoteIdx] = useState(() => Math.floor(Math.random() * QUOTES.length));
  const [fading, setFading] = useState(false);

  const nextQuote = () => {
    setFading(true);
    setTimeout(() => {
      setQuoteIdx((i) => (i + 1) % QUOTES.length);
      setFading(false);
    }, 300);
  };

  const quote = QUOTES[quoteIdx];

  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></div>
            <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest">Daily Spark</h3>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-400/10 text-yellow-400/90 font-mono border border-yellow-400/20">
            Inspire
          </span>
        </div>
        <motion.div
          animate={{ opacity: fading ? 0 : 1, y: fading ? 5 : 0 }}
          transition={{ duration: 0.3 }}
          className="flex-1"
        >
          <svg className="w-7 h-7 text-yellow-400/40 mb-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
          </svg>
          <p className="text-white/90 text-base sm:text-lg font-medium leading-relaxed italic">
            "{quote.text}"
          </p>
          <p className="text-white/40 text-xs sm:text-sm mt-3 font-medium">— {quote.author}</p>
        </motion.div>
      </div>
      <button
        onClick={nextQuote}
        className="mt-4 flex items-center gap-2 text-yellow-400/70 hover:text-yellow-400 text-xs font-semibold px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-yellow-400/30 transition-all self-start"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <span>New Quote</span>
      </button>
    </div>
  );
};

// Task Item Component
const TaskItem = ({ task, onToggle, onDelete }) => {
  const cfg = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20, height: 0 }}
      className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-white/[0.06] border border-transparent hover:border-white/10 group transition-all backdrop-blur-sm"
    >
      <button
        onClick={() => onToggle(task._id, !task.completed)}
        className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
          task.completed ? 'bg-violet-600 border-violet-600' : 'border-white/20 hover:border-violet-400'
        }`}
      >
        {task.completed && (
          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>
      <span className={`flex-1 text-sm ${task.completed ? 'line-through text-white/30' : 'text-white/85 font-medium'}`}>
        {task.title}
      </span>
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg bg-white/[0.06] border border-white/10 ${cfg.color} flex-shrink-0`}>
        {cfg.label}
      </span>
      <button
        onClick={() => onDelete(task._id)}
        className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-red-400 transition-all p-1"
        title="Delete task"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </motion.div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [priority, setPriority] = useState('medium');
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [addingTask, setAddingTask] = useState(false);
  const [focusStats, setFocusStats] = useState({ totalSessions: 0, totalMinutes: 0 });

  const fetchTasks = useCallback(async () => {
    try {
      const { data } = await api.get('/tasks');
      setTasks(data);
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      setLoadingTasks(false);
    }
  }, []);

  const fetchFocusStats = useCallback(async () => {
    try {
      const { data } = await api.get('/focus');
      setFocusStats({ totalSessions: data.totalSessions, totalMinutes: data.totalMinutes });
    } catch {}
  }, []);

  useEffect(() => {
    fetchTasks();
    fetchFocusStats();
  }, [fetchTasks, fetchFocusStats]);

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    setAddingTask(true);
    try {
      const { data } = await api.post('/tasks', { title: newTask.trim(), priority });
      setTasks([data, ...tasks]);
      setNewTask('');
      toast.success('Task added!');
    } catch {
      toast.error('Failed to add task');
    } finally {
      setAddingTask(false);
    }
  };

  const toggleTask = async (id, completed) => {
    try {
      const { data } = await api.patch(`/tasks/${id}`, { completed });
      setTasks(tasks.map((t) => (t._id === id ? data : t)));
    } catch {
      toast.error('Failed to update task');
    }
  };

  const deleteTask = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(tasks.filter((t) => t._id !== id));
      toast.success('Task deleted');
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const completionRate = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="relative min-h-screen bg-[#070614] p-6 lg:p-8 pt-20 lg:pt-8 overflow-hidden">
      {/* LineWaves WebGL Background from React Bits */}
      <div className="fixed inset-0 z-0 overflow-hidden" style={{ background: '#070614' }}>
        <LineWaves
          color1="#8b5cf6"
          color2="#06b6d4"
          color3="#ec4899"
          speed={0.3}
          lineCount={72}
          lineWidth={1.3}
          glow={0.8}
          brightness={1.1}
          highlight={1}
          warpIntensity={1}
          rotation={-33}
          enableMouseInteraction={true}
          clickRipple={true}
          opacity={1}
        />
      </div>

      {/* Foreground Content with Dark Obsidian Glassmorphic Blocks */}
      <div className="relative z-10 max-w-6xl mx-auto space-y-6">
        {/* Header Greeting Block */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="p-5 sm:p-6 rounded-3xl bg-[#0e0c24]/80 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.45)] w-full">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'},{' '}
              <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
            </h1>
            <p className="text-white/45 text-xs sm:text-sm mt-1 font-medium">
              Here's your productivity overview with live ambient waves
            </p>
          </div>
        </motion.div>

        {/* Glassmorphic Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {[
            {
              label: 'Tasks Today',
              value: tasks.length,
              icon: '📋',
              glow: 'rgba(139, 92, 246, 0.35)',
              accent: 'text-violet-400',
              border: 'hover:border-violet-400/40',
            },
            {
              label: 'Completed',
              value: completedCount,
              icon: '✅',
              glow: 'rgba(34, 197, 94, 0.35)',
              accent: 'text-emerald-400',
              border: 'hover:border-emerald-400/40',
            },
            {
              label: 'Focus Sessions',
              value: focusStats.totalSessions,
              icon: '🎯',
              glow: 'rgba(6, 182, 212, 0.35)',
              accent: 'text-cyan-400',
              border: 'hover:border-cyan-400/40',
            },
            {
              label: 'Focus Minutes',
              value: focusStats.totalMinutes,
              icon: '⏱',
              glow: 'rgba(236, 72, 153, 0.35)',
              accent: 'text-pink-400',
              border: 'hover:border-pink-400/40',
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`relative overflow-hidden rounded-3xl p-5 backdrop-blur-xl bg-[#0e0c24]/80 border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.45)] ${stat.border} hover:bg-[#131030]/85 transition-all duration-300 group`}
            >
              <div
                className="pointer-events-none absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-20 blur-xl group-hover:opacity-45 transition-opacity"
                style={{ background: stat.glow }}
              />
              <div className="relative z-10 flex items-center justify-between mb-3">
                <span className="text-2xl p-2 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md group-hover:scale-110 transition-transform">
                  {stat.icon}
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/10 ${stat.accent}`}>
                  Active
                </span>
              </div>
              <div className={`text-3xl font-black tracking-tight ${stat.accent}`}>{stat.value}</div>
              <div className="text-xs text-white/50 font-medium mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Main Grid: Clock & Quote Widgets */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Glassmorphic Clock Widget */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="relative overflow-hidden rounded-3xl p-8 flex flex-col items-center justify-center min-h-[220px] backdrop-blur-xl bg-[#0e0c24]/80 border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.45)] hover:border-white/20 transition-all gradient-border"
          >
            <Clock />
          </motion.div>

          {/* Glassmorphic Daily Spark Quote Widget */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25 }}
            className="relative overflow-hidden rounded-3xl p-6 min-h-[220px] backdrop-blur-xl bg-[#0e0c24]/80 border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.45)] hover:border-white/20 transition-all"
          >
            <QuoteCard />
          </motion.div>
        </div>

        {/* Glassmorphic Today's Tasks Widget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative overflow-hidden rounded-3xl p-6 backdrop-blur-xl bg-[#0e0c24]/80 border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.45)] hover:border-white/20 transition-all"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-violet-400 animate-pulse"></div>
              <h3 className="font-bold text-white tracking-wide">Today's Tasks</h3>
              <span className="text-xs bg-violet-500/20 text-violet-300 border border-violet-500/30 px-2.5 py-0.5 rounded-full font-mono">
                {completedCount}/{tasks.length}
              </span>
            </div>
            {tasks.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden border border-white/10">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${completionRate}%` }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="h-full bg-gradient-to-r from-violet-600 via-pink-500 to-cyan-400 rounded-full"
                  />
                </div>
                <span className="text-xs text-white/50 font-mono font-medium">{completionRate}%</span>
              </div>
            )}
          </div>

          {/* Glass Add Task Form */}
          <form onSubmit={addTask} className="flex gap-2.5 mb-5">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Add a new task..."
              className="py-2.5 px-4 text-sm flex-1 rounded-2xl bg-white/[0.05] border border-white/10 text-white placeholder-white/30 focus:border-violet-400/60 focus:bg-white/[0.08] focus:outline-none transition-all"
            />
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="py-2.5 px-3 text-xs sm:text-sm w-28 sm:w-32 flex-shrink-0 rounded-2xl bg-[#141232] border border-white/10 text-white/80 focus:border-violet-400/60 focus:outline-none transition-all"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium</option>
              <option value="high">High Priority</option>
            </select>
            <button
              type="submit"
              disabled={addingTask || !newTask.trim()}
              className="btn-primary py-2.5 px-5 text-sm flex-shrink-0 rounded-2xl shadow-[0_0_15px_rgba(139,92,246,0.4)]"
            >
              {addingTask ? (
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
              )}
            </button>
          </form>

          {/* Task List */}
          {loadingTasks ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-4xl mb-3">🎉</div>
              <p className="text-white/40 text-sm">No tasks yet. Add one above to kick off your day!</p>
            </div>
          ) : (
            <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
              <AnimatePresence>
                {tasks.map((task) => (
                  <TaskItem key={task._id} task={task} onToggle={toggleTask} onDelete={deleteTask} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;

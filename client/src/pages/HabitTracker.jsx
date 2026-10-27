import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../api/axios';

const COLORS = ['#22d3ee','#8b5cf6','#10b981','#f97316','#f43f5e','#facc15','#3b82f6','#a855f7'];
const TODAY = () => new Date().toISOString().slice(0, 10);

// Get last 105 days for heatmap (15 weeks)
function getLast105Days() {
  const days = [];
  const now = new Date();
  for (let i = 104; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function streak(checkins = []) {
  const set = new Set(checkins);
  let s = 0;
  const d = new Date();
  while (true) {
    const key = d.toISOString().slice(0, 10);
    if (!set.has(key)) break;
    s++;
    d.setDate(d.getDate() - 1);
  }
  return s;
}

function HeatmapCell({ date, checked, onClick, color }) {
  const today = TODAY();
  const isToday = date === today;
  return (
    <motion.button
      whileHover={{ scale: 1.4 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => onClick(date)}
      title={date}
      className={`w-3 h-3 rounded-sm transition-all duration-200 ${isToday ? 'ring-1 ring-white/40' : ''}`}
      style={{
        background: checked ? color : 'rgba(255,255,255,0.07)',
        boxShadow: checked ? `0 0 6px ${color}88` : 'none',
      }}
    />
  );
}

function HabitCard({ habit, onToggle, onDelete, onEdit }) {
  const days = getLast105Days();
  const checkinSet = new Set(habit.checkins || []);
  const s = streak(habit.checkins);
  const today = TODAY();
  const doneToday = checkinSet.has(today);
  const totalDone = habit.checkins?.length || 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="glass-dark rounded-2xl p-5 border border-white/10 hover:border-white/20 transition-all"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: habit.color, boxShadow: `0 0 8px ${habit.color}` }} />
          <div>
            <h3 className="font-semibold text-white text-sm">{habit.name}</h3>
            <span className="text-xs text-white/40 capitalize">{habit.frequency}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => onEdit(habit)} className="text-white/30 hover:text-white/70 transition-colors text-xs">✎</button>
          <button onClick={() => onDelete(habit._id)} className="text-white/30 hover:text-red-400 transition-colors text-xs">✕</button>
        </div>
      </div>

      {/* Heatmap grid */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-0.5">
          {days.map(date => (
            <HeatmapCell
              key={date}
              date={date}
              checked={checkinSet.has(date)}
              onClick={() => onToggle(habit._id, date)}
              color={habit.color}
            />
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between">
        <div className="flex gap-4">
          <div className="text-center">
            <div className="text-lg font-bold" style={{ color: habit.color }}>{s}</div>
            <div className="text-xs text-white/40">streak</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-white/70">{totalDone}</div>
            <div className="text-xs text-white/40">total</div>
          </div>
        </div>
        {/* Today toggle */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => onToggle(habit._id, today)}
          className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
          style={{
            background: doneToday ? habit.color : 'rgba(255,255,255,0.08)',
            color: doneToday ? '#000' : '#fff',
            boxShadow: doneToday ? `0 0 12px ${habit.color}66` : 'none',
          }}
        >
          {doneToday ? '✓ Done' : 'Check In'}
        </motion.button>
      </div>

      {/* Badge */}
      {s >= 7 && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mt-3 flex items-center gap-2">
          <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
            🏆 {s >= 30 ? 'Month Warrior' : s >= 14 ? 'Two-Week Hero' : 'Week Streak!'}
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}

function AddHabitModal({ onClose, onSave, editHabit }) {
  const [name, setName] = useState(editHabit?.name || '');
  const [frequency, setFrequency] = useState(editHabit?.frequency || 'daily');
  const [color, setColor] = useState(editHabit?.color || COLORS[0]);

  const handleSave = () => {
    if (!name.trim()) return toast.error('Enter a habit name');
    onSave({ name: name.trim(), frequency, color });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glass-dark rounded-2xl p-6 w-full max-w-md border border-white/20 mx-4"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-white mb-5">{editHabit ? 'Edit Habit' : 'New Habit'}</h2>
        <div className="space-y-4">
          <input
            className="input-field"
            placeholder="Habit name…"
            value={name}
            onChange={e => setName(e.target.value)}
            autoFocus
          />
          <div>
            <label className="text-xs text-white/50 mb-2 block">Frequency</label>
            <div className="flex gap-3">
              {['daily', 'weekly'].map(f => (
                <button
                  key={f}
                  onClick={() => setFrequency(f)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all capitalize ${frequency === f ? 'bg-violet-600 text-white' : 'bg-white/8 text-white/60 hover:bg-white/15'}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-white/50 mb-2 block">Color</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className="w-7 h-7 rounded-full transition-all"
                  style={{ background: c, boxShadow: color === c ? `0 0 10px ${c}` : 'none', transform: color === c ? 'scale(1.25)' : 'scale(1)' }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
            <button onClick={handleSave} className="btn-primary flex-1">Save</button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function HabitTracker() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editHabit, setEditHabit] = useState(null);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/habits');
      setHabits(data.habits || []);
    } catch { toast.error('Failed to load habits'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (payload) => {
    try {
      if (editHabit) {
        const { data } = await api.patch(`/habits/${editHabit._id}`, payload);
        setHabits(h => h.map(x => x._id === editHabit._id ? data.habit : x));
        toast.success('Habit updated!');
      } else {
        const { data } = await api.post('/habits', payload);
        setHabits(h => [...h, data.habit]);
        toast.success('Habit added!');
      }
    } catch { toast.error('Failed to save habit'); }
    setEditHabit(null);
  };

  const handleToggle = async (id, date) => {
    try {
      const { data } = await api.post(`/habits/${id}/checkin`, { date });
      setHabits(h => h.map(x => x._id === id ? data.habit : x));
    } catch { toast.error('Failed to update check-in'); }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/habits/${id}`);
      setHabits(h => h.filter(x => x._id !== id));
      toast.success('Habit deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const openEdit = (habit) => { setEditHabit(habit); setShowModal(true); };

  return (
    <div className="min-h-screen p-6 md:p-8">
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-20 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-60 h-60 bg-cyan-500/8 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Habit Tracker</h1>
            <p className="text-white/40 text-sm mt-1">Build streaks, earn badges</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { setEditHabit(null); setShowModal(true); }}
            className="btn-primary flex items-center gap-2"
          >
            <span>+</span> New Habit
          </motion.button>
        </motion.div>

        {/* Summary bar */}
        {habits.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Active Habits', value: habits.length, icon: '🎯' },
              { label: 'Done Today', value: habits.filter(h => h.checkins?.includes(TODAY())).length, icon: '✅' },
              { label: 'Best Streak', value: Math.max(0, ...habits.map(h => streak(h.checkins))), icon: '🔥' },
            ].map(stat => (
              <div key={stat.label} className="glass-dark rounded-xl p-4 border border-white/10 text-center">
                <div className="text-2xl mb-1">{stat.icon}</div>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-white/40">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Habits grid */}
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : habits.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <div className="text-6xl mb-4">🌱</div>
            <p className="text-white/50 text-lg">No habits yet. Start building one!</p>
          </motion.div>
        ) : (
          <AnimatePresence>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {habits.map(h => (
                <HabitCard key={h._id} habit={h} onToggle={handleToggle} onDelete={handleDelete} onEdit={openEdit} />
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <AddHabitModal
            onClose={() => { setShowModal(false); setEditHabit(null); }}
            onSave={handleSave}
            editHabit={editHabit}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

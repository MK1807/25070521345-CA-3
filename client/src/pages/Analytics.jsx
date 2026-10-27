import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import api from '../api/axios';
import toast from 'react-hot-toast';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-dark p-3 rounded-xl border border-white/10 shadow-xl">
        <p className="text-white/60 text-xs mb-1 font-mono">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} style={{ color: entry.color }} className="text-sm font-semibold">
            {entry.name}: <span className="text-white">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const StatCard = ({ label, value, unit, icon, gradient, delay, subtitle }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className={`glass-dark rounded-3xl bg-gradient-to-br ${gradient} p-5 border border-white/10 relative overflow-hidden`}
  >
    <div className="absolute top-3 right-3 text-3xl opacity-20">{icon}</div>
    <div className="text-xs text-white/40 font-medium uppercase tracking-wider mb-2">{label}</div>
    <div className="text-3xl font-extrabold text-white">
      {value}
      <span className="text-sm text-white/40 font-normal ml-1">{unit}</span>
    </div>
    {subtitle && <p className="text-xs text-white/30 mt-1">{subtitle}</p>}
  </motion.div>
);

const Analytics = () => {
  const [data, setData] = useState({
    stats: [],
    totalSessions: 0,
    totalMinutes: 0,
    breakMinutes: 0,
    peakHour: null,
    productivityScore: 0,
    hours: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const { data: res } = await api.get('/focus');
      setData(res || {});
    } catch {
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const chartData = (data.stats || []).map((d) => ({
    ...d,
    day: new Date(d.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
  }));

  const totalHours = ((data.totalMinutes || 0) / 60).toFixed(1);
  const totalBreakHours = ((data.breakMinutes || 0) / 60).toFixed(1);
  const streak = (() => {
    let count = 0;
    const stats = data.stats || [];
    for (let i = stats.length - 1; i >= 0; i--) {
      if (stats[i].sessions > 0) count++;
      else break;
    }
    return count;
  })();

  const formatHour = (h) => {
    if (h === null || h === undefined) return 'N/A';
    const ampm = h >= 12 ? 'PM' : 'AM';
    const formatted = h % 12 || 12;
    return `${formatted}:00 ${ampm}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-white/40 text-sm">Loading focus metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-10 relative">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3">
            <span className="text-3xl">📊</span>
            <h1 className="text-3xl font-extrabold gradient-text">Task & Focus Analytics</h1>
          </div>
          <p className="text-white/40 text-sm mt-1">
            Weekly productivity metrics, peak focus hours, and task-to-break ratio
          </p>
        </motion.div>

        {/* 4 Key Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            label="Productivity Score"
            value={data.productivityScore || 0}
            unit="/100"
            icon="🏆"
            gradient="from-violet-600/20 to-indigo-900/10"
            delay={0.1}
            subtitle="Based on sessions & consistency"
          />
          <StatCard
            label="Peak Focus Hour"
            value={data.peakHour !== null ? formatHour(data.peakHour) : '10:00 AM'}
            unit=""
            icon="⚡"
            gradient="from-amber-600/20 to-orange-900/10"
            delay={0.15}
            subtitle="Most productive time of day"
          />
          <StatCard
            label="Total Focus Time"
            value={totalHours}
            unit="hrs"
            icon="⏰"
            gradient="from-cyan-600/20 to-blue-900/10"
            delay={0.2}
            subtitle={`${data.totalSessions || 0} pomodoro cycles`}
          />
          <StatCard
            label="Current Streak"
            value={streak}
            unit="days"
            icon="🔥"
            gradient="from-rose-600/20 to-pink-900/10"
            delay={0.25}
            subtitle="Daily consecutive work"
          />
        </div>

        {/* Focus Breakdown vs Breaks Chart & Sessions Chart */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Focus vs Break Minutes Stacked / Dual Area Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-dark rounded-3xl p-6 border border-white/10"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-violet-400"></div>
                <h3 className="font-bold text-white text-sm">Focus vs. Break Minutes</h3>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="text-violet-400">■ Focus ({totalHours}h)</span>
                <span className="text-emerald-400">■ Breaks ({totalBreakHours}h)</span>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="focusMinsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="breakMinsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="minutes" name="Focus Mins" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#focusMinsGrad)" />
                <Area type="monotone" dataKey="breakMinutes" name="Break Mins" stroke="#10b981" strokeWidth={2} fill="url(#breakMinsGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Bar Chart - Sessions Completed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="glass-dark rounded-3xl p-6 border border-white/10"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400"></div>
                <h3 className="font-bold text-white text-sm">Completed Focus Sessions</h3>
              </div>
              <span className="text-xs text-white/40 font-mono">Total: {data.totalSessions} sessions</span>
            </div>

            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="sessionsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="sessions" name="Sessions" fill="url(#sessionsGrad)" radius={[6, 6, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Detailed Weekly Breakdown List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-dark rounded-3xl p-6 border border-white/10"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-pink-400"></div>
              <h3 className="font-bold text-white text-sm">7-Day Daily Log & Streak Status</h3>
            </div>
            <span className="text-xs text-white/40">MongoDB Focus Sessions</span>
          </div>

          <div className="space-y-3">
            {chartData.map((d, i) => {
              const maxMins = Math.max(...(data.stats || []).map((s) => s.minutes), 1);
              const pct = Math.min(100, (d.minutes / maxMins) * 100);
              const isToday = i === chartData.length - 1;
              const isBest = d.minutes === maxMins && d.minutes > 0;

              return (
                <div key={d.date} className="flex items-center gap-3">
                  <div className={`text-xs font-medium w-24 flex-shrink-0 font-mono ${isToday ? 'text-violet-400 font-bold' : 'text-white/40'}`}>
                    {d.day}
                    {isToday ? ' (today)' : ''}
                  </div>
                  <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: 0.2 + i * 0.05, duration: 0.6 }}
                      className={`h-full rounded-full ${
                        isBest
                          ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                          : 'bg-gradient-to-r from-violet-500 to-cyan-500'
                      }`}
                    />
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 text-xs font-mono">
                    <span className="text-white/70 w-16 text-right">{d.minutes} min</span>
                    <span className="text-white/20">·</span>
                    <span className="text-white/40 w-20">{d.sessions} session{d.sessions !== 1 ? 's' : ''}</span>
                    {isBest && d.minutes > 0 && <span title="Best day this week!">🏆</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Analytics;

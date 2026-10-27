import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../api/axios';

const COLUMNS = [
  { id: 'todo', title: 'To Do', color: '#8b5cf6', icon: '📝' },
  { id: 'in_progress', title: 'In Progress', color: '#06b6d4', icon: '⚡' },
  { id: 'completed', title: 'Completed', color: '#10b981', icon: '✅' },
];

const PRIORITIES = [
  { id: 'low', label: 'Low', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  { id: 'medium', label: 'Medium', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  { id: 'high', label: 'High', badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
];

const COLOR_OPTIONS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#3b82f6'];

export default function Kanban() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('all');

  // Inline creation modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [targetColumn, setTargetColumn] = useState('todo');
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [tag, setTag] = useState('');
  const [color, setColor] = useState('#8b5cf6');
  const [deadline, setDeadline] = useState('');
  const [subtasksInput, setSubtasksInput] = useState('');

  // Fetch tasks from MongoDB
  const fetchTasks = async () => {
    try {
      const { data } = await api.get('/tasks');
      setTasks(data || []);
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Move task to next or previous column
  const handleMoveStatus = async (taskId, newStatus) => {
    try {
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) =>
          t._id === taskId
            ? { ...t, status: newStatus, completed: newStatus === 'completed' }
            : t
        )
      );
      await api.patch(`/tasks/${taskId}`, { status: newStatus });
    } catch {
      toast.error('Failed to update task status');
      fetchTasks();
    }
  };

  // Toggle subtask
  const handleToggleSubtask = async (task, subIndex) => {
    const updatedSubtasks = task.subtasks.map((st, i) =>
      i === subIndex ? { ...st, done: !st.done } : st
    );
    try {
      setTasks((prev) =>
        prev.map((t) => (t._id === task._id ? { ...t, subtasks: updatedSubtasks } : t))
      );
      await api.patch(`/tasks/${task._id}`, { subtasks: updatedSubtasks });
    } catch {
      toast.error('Failed to update subtask');
      fetchTasks();
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
      await api.delete(`/tasks/${taskId}`);
      toast.success('Task removed');
    } catch {
      toast.error('Failed to delete task');
      fetchTasks();
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return toast.error('Please enter a task title');

    const subtasks = subtasksInput
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => ({ title: s, done: false }));

    try {
      const { data } = await api.post('/tasks', {
        title: title.trim(),
        status: targetColumn,
        priority,
        tag: tag.trim(),
        color,
        deadline: deadline || null,
        subtasks,
      });

      setTasks((prev) => [data, ...prev]);
      setTitle('');
      setTag('');
      setDeadline('');
      setSubtasksInput('');
      setShowAddModal(false);
      toast.success('Task created and saved to MongoDB');
    } catch {
      toast.error('Failed to create task');
    }
  };

  // Unique tags for filtering
  const allTags = useMemo(() => {
    const set = new Set();
    tasks.forEach((t) => {
      if (t.tag) set.add(t.tag);
    });
    return Array.from(set);
  }, [tasks]);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
      if (tagFilter !== 'all' && t.tag !== tagFilter) return false;
      return true;
    });
  }, [tasks, priorityFilter, tagFilter]);

  return (
    <div className="min-h-screen p-6 md:p-10 relative">
      <div className="max-w-7xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-3xl">📋</span>
              <h1 className="text-3xl font-extrabold gradient-text">Kanban Task Board</h1>
            </div>
            <p className="text-white/40 text-sm mt-1">
              Multi-column task workflows with deadline progress and sub-task checklists
            </p>
          </div>

          {/* Filters & Action */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-white/5 border border-white/10 text-white/80 rounded-xl px-3 py-2 text-xs outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900">All Priorities</option>
              <option value="high" className="bg-slate-900">High Priority</option>
              <option value="medium" className="bg-slate-900">Medium Priority</option>
              <option value="low" className="bg-slate-900">Low Priority</option>
            </select>

            {/* Tag Filter */}
            {allTags.length > 0 && (
              <select
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
                className="bg-white/5 border border-white/10 text-white/80 rounded-xl px-3 py-2 text-xs outline-none cursor-pointer"
              >
                <option value="all" className="bg-slate-900">All Tags</option>
                {allTags.map((tg) => (
                  <option key={tg} value={tg} className="bg-slate-900">#{tg}</option>
                ))}
              </select>
            )}

            <button
              onClick={() => {
                setTargetColumn('todo');
                setShowAddModal(true);
              }}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <span>+</span> Add Task
            </button>
          </div>
        </div>

        {/* Kanban Board Columns Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {COLUMNS.map((col) => {
              const colTasks = filteredTasks.filter((t) => (t.status || 'todo') === col.id);

              return (
                <div
                  key={col.id}
                  className="glass-dark rounded-3xl p-5 border border-white/10 flex flex-col min-h-[600px] relative overflow-hidden"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/5">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{col.icon}</span>
                      <h3 className="font-bold text-white text-base">{col.title}</h3>
                      <span
                        className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold"
                        style={{
                          backgroundColor: `${col.color}20`,
                          color: col.color,
                        }}
                      >
                        {colTasks.length}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setTargetColumn(col.id);
                        setShowAddModal(true);
                      }}
                      className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white flex items-center justify-center text-sm transition-all"
                      title={`Add task to ${col.title}`}
                    >
                      +
                    </button>
                  </div>

                  {/* Task Cards Container */}
                  <div className="space-y-4 flex-1 overflow-y-auto pr-1">
                    <AnimatePresence>
                      {colTasks.map((task) => {
                        const prio = PRIORITIES.find((p) => p.id === task.priority) || PRIORITIES[1];
                        const totalSubs = task.subtasks?.length || 0;
                        const doneSubs = task.subtasks?.filter((s) => s.done).length || 0;
                        const subProgress = totalSubs > 0 ? (doneSubs / totalSubs) * 100 : 0;

                        return (
                          <motion.div
                            key={task._id}
                            layout
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="glass rounded-2xl p-4 border border-white/10 hover:border-white/20 transition-all group relative"
                            style={{
                              borderLeft: `4px solid ${task.color || col.color}`,
                            }}
                          >
                            {/* Card Top Row */}
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <span
                                className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md border ${prio.badge}`}
                              >
                                {prio.label}
                              </span>

                              <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => handleDeleteTask(task._id)}
                                  className="text-white/40 hover:text-red-400 text-xs p-1"
                                  title="Delete task"
                                >
                                  ✕
                                </button>
                              </div>
                            </div>

                            {/* Task Title */}
                            <h4
                              className={`text-sm font-semibold text-white/95 mb-2 ${
                                task.completed ? 'line-through text-white/50' : ''
                              }`}
                            >
                              {task.title}
                            </h4>

                            {/* Tags & Deadline */}
                            <div className="flex flex-wrap items-center gap-2 mb-3 text-[11px] text-white/50">
                              {task.tag && (
                                <span className="px-2 py-0.5 rounded bg-white/5 text-violet-300 font-mono">
                                  #{task.tag}
                                </span>
                              )}
                              {task.deadline && (
                                <span className="flex items-center gap-1 text-white/40 font-mono">
                                  <span>📅</span>
                                  {new Date(task.deadline).toLocaleDateString(undefined, {
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </span>
                              )}
                            </div>

                            {/* Subtask Progress Bar & Checklist */}
                            {totalSubs > 0 && (
                              <div className="mb-3 space-y-1.5 pt-2 border-t border-white/5">
                                <div className="flex justify-between text-[11px] font-mono text-white/40">
                                  <span>Subtasks</span>
                                  <span>{doneSubs}/{totalSubs}</span>
                                </div>
                                <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                                  <div
                                    className="h-full bg-emerald-400 transition-all duration-300"
                                    style={{ width: `${subProgress}%` }}
                                  />
                                </div>

                                <div className="space-y-1 pt-1">
                                  {task.subtasks.map((st, i) => (
                                    <label
                                      key={i}
                                      className="flex items-center gap-2 text-xs text-white/70 cursor-pointer hover:text-white"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={st.done}
                                        onChange={() => handleToggleSubtask(task, i)}
                                        className="rounded accent-emerald-500 w-3.5 h-3.5 cursor-pointer"
                                      />
                                      <span className={st.done ? 'line-through text-white/40' : ''}>
                                        {st.title}
                                      </span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Column Switcher Buttons */}
                            <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-white/5">
                              {col.id !== 'todo' && (
                                <button
                                  onClick={() =>
                                    handleMoveStatus(
                                      task._id,
                                      col.id === 'completed' ? 'in_progress' : 'todo'
                                    )
                                  }
                                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-[11px] font-medium"
                                >
                                  ← Move Left
                                </button>
                              )}
                              {col.id !== 'completed' && (
                                <button
                                  onClick={() =>
                                    handleMoveStatus(
                                      task._id,
                                      col.id === 'todo' ? 'in_progress' : 'completed'
                                    )
                                  }
                                  className="px-2.5 py-1 rounded-lg bg-violet-600/30 hover:bg-violet-600/50 border border-violet-500/40 text-violet-200 text-[11px] font-medium"
                                >
                                  Move Right →
                                </button>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>

                    {colTasks.length === 0 && (
                      <div className="text-center py-16 text-white/20 text-xs">
                        No tasks in this lane
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Inline Task Creation Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-dark rounded-3xl p-6 w-full max-w-lg border border-white/20 shadow-2xl"
            >
              <h3 className="text-xl font-bold text-white mb-4">Create New Task</h3>

              <form onSubmit={handleCreateTask} className="space-y-4">
                <div>
                  <label className="text-xs text-white/50 block mb-1">Task Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Implement dark mode glassmorphism UI"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="input-field"
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-white/50 block mb-1">Initial Column</label>
                    <select
                      value={targetColumn}
                      onChange={(e) => setTargetColumn(e.target.value)}
                      className="input-field cursor-pointer"
                    >
                      <option value="todo" className="bg-slate-900">To Do</option>
                      <option value="in_progress" className="bg-slate-900">In Progress</option>
                      <option value="completed" className="bg-slate-900">Completed</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-white/50 block mb-1">Priority</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="input-field cursor-pointer"
                    >
                      <option value="low" className="bg-slate-900">Low Priority</option>
                      <option value="medium" className="bg-slate-900">Medium Priority</option>
                      <option value="high" className="bg-slate-900">High Priority</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-white/50 block mb-1">Tag (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g., frontend, bug"
                      value={tag}
                      onChange={(e) => setTag(e.target.value)}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-white/50 block mb-1">Deadline (Optional)</label>
                    <input
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="input-field cursor-pointer"
                    />
                  </div>
                </div>

                {/* Color Tag Picker */}
                <div>
                  <label className="text-xs text-white/50 block mb-2">Accent Color</label>
                  <div className="flex gap-2">
                    {COLOR_OPTIONS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className={`w-7 h-7 rounded-full transition-transform ${
                          color === c ? 'scale-125 ring-2 ring-white' : 'hover:scale-110'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>

                {/* Subtasks Multi-line */}
                <div>
                  <label className="text-xs text-white/50 block mb-1">
                    Subtasks (1 per line, optional)
                  </label>
                  <textarea
                    rows="3"
                    placeholder="Draft design mockup&#10;Write unit tests&#10;Ship deployment"
                    value={subtasksInput}
                    onChange={(e) => setSubtasksInput(e.target.value)}
                    className="input-field resize-none text-xs font-mono"
                  />
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="btn-ghost flex-1 text-sm"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary flex-1 text-sm">
                    Create Task
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

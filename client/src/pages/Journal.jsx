import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';
import api from '../api/axios';

const MOODS = [
  { id: 'calm', label: 'Calm', emoji: '🧘', color: '#06b6d4' },
  { id: 'focused', label: 'Focused', emoji: '⚡', color: '#8b5cf6' },
  { id: 'energized', label: 'Energized', emoji: '🔥', color: '#f59e0b' },
  { id: 'grateful', label: 'Grateful', emoji: '🌸', color: '#ec4899' },
  { id: 'low', label: 'Reflective', emoji: '🌧️', color: '#64748b' },
];

const DAILY_PROMPTS = [
  'What is the single most meaningful win you had today?',
  'What friction or distraction held your focus back, and how will you adapt?',
  'Name 3 small moments from today that brought you genuine calm or gratitude.',
  'What is your primary focus intention for tomorrow morning?',
  'How did your mind feel during your deepest work sessions today?',
];

export default function Journal() {
  const [entries, setEntries] = useState([]);
  const [activeEntry, setActiveEntry] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [savingState, setSavingState] = useState('saved'); // 'saved' | 'saving' | 'unsaved'
  const [previewMode, setPreviewMode] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const autoSaveTimerRef = useRef(null);

  // Fetch all journal entries from MongoDB
  const fetchEntries = async () => {
    try {
      const { data } = await api.get('/journal');
      setEntries(data || []);
      if (data?.length > 0 && !activeEntry) {
        setActiveEntry(data[0]);
      }
    } catch {
      toast.error('Failed to load journal entries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  // Save current active entry to backend
  const saveEntry = useCallback(async (entryToSave) => {
    if (!entryToSave || !entryToSave._id) return;
    setSavingState('saving');
    try {
      const { data } = await api.patch(`/journal/${entryToSave._id}`, {
        title: entryToSave.title,
        content: entryToSave.content,
        mood: entryToSave.mood,
        tags: entryToSave.tags,
      });
      setSavingState('saved');
      setEntries((prev) => prev.map((e) => (e._id === data._id ? data : e)));
    } catch {
      setSavingState('unsaved');
      toast.error('Auto-save failed');
    }
  }, []);

  // Debounced auto-save on content/title/mood changes
  const handleFieldChange = (field, value) => {
    if (!activeEntry) return;
    const updated = { ...activeEntry, [field]: value };
    setActiveEntry(updated);
    setSavingState('unsaved');

    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      saveEntry(updated);
    }, 1200);
  };

  const handleCreateNew = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await api.post('/journal', {
        title: `Reflection - ${today}`,
        content: '## Daily Reflection\n\nWrite your thoughts, clarity notes, and reflections here...',
        mood: 'calm',
        tags: ['mindfulness'],
        date: today,
      });

      setEntries((prev) => [data, ...prev]);
      setActiveEntry(data);
      setSavingState('saved');
      toast.success('New reflection created');
    } catch {
      toast.error('Failed to create entry');
    }
  };

  const handleDeleteEntry = async (id, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/journal/${id}`);
      const remaining = entries.filter((item) => item._id !== id);
      setEntries(remaining);
      if (activeEntry?._id === id) {
        setActiveEntry(remaining[0] || null);
      }
      toast.success('Entry deleted');
    } catch {
      toast.error('Failed to delete entry');
    }
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().replace(/^#/, '');
      if (!activeEntry.tags?.includes(newTag)) {
        const nextTags = [...(activeEntry.tags || []), newTag];
        handleFieldChange('tags', nextTags);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    const nextTags = activeEntry.tags?.filter((t) => t !== tagToRemove) || [];
    handleFieldChange('tags', nextTags);
  };

  const handleInsertPrompt = (promptText) => {
    const addition = `\n\n> **Prompt:** ${promptText}\n\n`;
    handleFieldChange('content', (activeEntry?.content || '') + addition);
    toast.success('Prompt inserted!');
  };

  // Mood history counter
  const moodCounts = entries.reduce((acc, cur) => {
    acc[cur.mood] = (acc[cur.mood] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative overflow-hidden">
      {/* Collapsible Entries Sidebar */}
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="glass-dark border-r border-white/10 flex flex-col h-screen overflow-hidden flex-shrink-0 z-20"
          >
            {/* Sidebar Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">📖</span>
                <h2 className="font-bold text-white text-sm">Reflections</h2>
              </div>
              <button
                onClick={handleCreateNew}
                className="px-3 py-1.5 rounded-xl bg-violet-600/30 hover:bg-violet-600/50 border border-violet-500/40 text-violet-200 text-xs font-semibold flex items-center gap-1 transition-all"
              >
                <span>+</span> New
              </button>
            </div>

            {/* Mood Summary Pill Bar */}
            <div className="px-4 py-3 bg-white/5 flex items-center justify-between gap-1 border-b border-white/5 overflow-x-auto text-xs">
              {MOODS.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-black/20 text-white/70"
                  title={`${m.label}: ${moodCounts[m.id] || 0} entries`}
                >
                  <span>{m.emoji}</span>
                  <span className="font-mono text-[10px]">{moodCounts[m.id] || 0}</span>
                </div>
              ))}
            </div>

            {/* List of Entries */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {loading ? (
                <p className="text-xs text-white/40 text-center py-10">Loading notes...</p>
              ) : entries.length === 0 ? (
                <p className="text-xs text-white/40 text-center py-10">No reflections yet.</p>
              ) : (
                entries.map((entry) => {
                  const m = MOODS.find((item) => item.id === entry.mood) || MOODS[0];
                  const isSelected = activeEntry?._id === entry._id;

                  return (
                    <div
                      key={entry._id}
                      onClick={() => setActiveEntry(entry)}
                      className={`p-3 rounded-2xl cursor-pointer transition-all border relative group ${
                        isSelected
                          ? 'glass border-violet-500/40 shadow-lg'
                          : 'bg-white/5 hover:bg-white/10 border-white/5'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="text-sm font-semibold text-white truncate flex-1">
                          {entry.title || 'Untitled'}
                        </span>
                        <span title={m.label} className="text-sm">
                          {m.emoji}
                        </span>
                      </div>

                      <p className="text-xs text-white/40 line-clamp-2 mb-2">
                        {entry.content?.replace(/#|\*|>|_/g, '') || 'Empty note...'}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-white/30 font-mono">
                        <span>{entry.date}</span>
                        <button
                          onClick={(e) => handleDeleteEntry(entry._id, e)}
                          className="opacity-0 group-hover:opacity-100 hover:text-red-400 p-1 transition-opacity"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Markdown Editor & Workspace */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Top Control Bar */}
        <div className="p-4 glass-dark border-b border-white/10 flex flex-wrap items-center justify-between gap-3 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all text-xs"
              title="Toggle Sidebar"
            >
              {sidebarOpen ? '◀ Collapse' : '▶ Expand Notes'}
            </button>

            {/* Auto-save Status Indicator */}
            <div className="flex items-center gap-2 text-xs font-mono">
              <div
                className={`w-2 h-2 rounded-full ${
                  savingState === 'saved'
                    ? 'bg-emerald-400'
                    : savingState === 'saving'
                    ? 'bg-amber-400 animate-ping'
                    : 'bg-rose-400'
                }`}
              />
              <span className="text-white/40">
                {savingState === 'saved'
                  ? 'Saved to MongoDB'
                  : savingState === 'saving'
                  ? 'Saving...'
                  : 'Unsaved edits'}
              </span>
            </div>
          </div>

          {/* Mood Selector Buttons */}
          <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-2xl border border-white/10">
            {MOODS.map((m) => (
              <button
                key={m.id}
                onClick={() => handleFieldChange('mood', m.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  activeEntry?.mood === m.id
                    ? 'bg-white/15 text-white shadow'
                    : 'text-white/40 hover:text-white/80'
                }`}
              >
                <span>{m.emoji}</span>
                <span className="hidden sm:inline">{m.label}</span>
              </button>
            ))}
          </div>

          {/* Preview / Edit Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                previewMode
                  ? 'bg-violet-600 text-white border-violet-500'
                  : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
              }`}
            >
              {previewMode ? 'Edit Mode ✏️' : 'Markdown Preview 👁️'}
            </button>
          </div>
        </div>

        {/* Quick Reflection Prompts Carousel/Bar */}
        <div className="px-6 py-2.5 bg-black/30 border-b border-white/5 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-white/40 uppercase tracking-widest font-mono text-[10px] flex-shrink-0">
            💡 Prompts:
          </span>
          {DAILY_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleInsertPrompt(prompt)}
              className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white flex-shrink-0 transition-all text-left"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Editor Area */}
        {activeEntry ? (
          <div className="flex-1 flex flex-col p-6 md:p-10 overflow-y-auto max-w-4xl mx-auto w-full">
            {/* Title Input */}
            <input
              type="text"
              value={activeEntry.title || ''}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              placeholder="Title your reflection..."
              className="text-2xl md:text-3xl font-extrabold bg-transparent text-white border-none outline-none placeholder-white/20 mb-4"
            />

            {/* Tag List & Add Input */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              {activeEntry.tags?.map((t) => (
                <span
                  key={t}
                  className="px-2.5 py-1 rounded-lg bg-violet-600/20 text-violet-300 border border-violet-500/30 text-xs font-mono flex items-center gap-1.5"
                >
                  #{t}
                  <button
                    onClick={() => handleRemoveTag(t)}
                    className="hover:text-red-400 font-bold ml-0.5"
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                type="text"
                placeholder="+ Add tag (Press Enter)"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                className="bg-transparent text-xs text-white/60 placeholder-white/20 border-b border-white/10 outline-none px-1 py-0.5 w-36"
              />
            </div>

            {/* Content Editor / Preview */}
            <div className="flex-1 flex flex-col">
              {previewMode ? (
                <div className="prose prose-invert max-w-none p-6 rounded-3xl glass-dark border border-white/10 text-white/90 font-light leading-relaxed">
                  <ReactMarkdown>{activeEntry.content || '*No content written yet.*'}</ReactMarkdown>
                </div>
              ) : (
                <textarea
                  value={activeEntry.content || ''}
                  onChange={(e) => handleFieldChange('content', e.target.value)}
                  placeholder="Write freely in Markdown. Format using # headings, - lists, > quotes, or **bold**..."
                  className="w-full flex-1 bg-transparent text-white/90 placeholder-white/20 outline-none resize-none font-mono text-sm leading-relaxed min-h-[400px]"
                />
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-white/40">
            <div className="text-center">
              <span className="text-5xl block mb-3">🌿</span>
              <p>Select or create a reflection from the sidebar.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

const express = require('express');
const Journal = require('../models/Journal');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

router.get('/', async (req, res) => {
  try {
    const notes = await Journal.find({ userId: req.user._id }).sort({ updatedAt: -1 });
    res.json(notes);
  } catch {
    res.status(500).json({ message: 'Failed to fetch journal entries' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, content, tags, mood, date } = req.body;
    const note = await Journal.create({
      userId: req.user._id,
      title: title || 'Untitled reflection',
      content: content || '',
      tags: Array.isArray(tags) ? tags : [],
      mood: mood || 'calm',
      date: date || new Date().toISOString().split('T')[0],
    });
    res.status(201).json(note);
  } catch {
    res.status(500).json({ message: 'Failed to create journal entry' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const note = await Journal.findOne({ _id: req.params.id, userId: req.user._id });
    if (!note) return res.status(404).json({ message: 'Entry not found' });
    const { title, content, tags, mood } = req.body;
    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    if (tags !== undefined) note.tags = tags;
    if (mood !== undefined) note.mood = mood;
    await note.save();
    res.json(note);
  } catch {
    res.status(500).json({ message: 'Failed to save journal entry' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const note = await Journal.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!note) return res.status(404).json({ message: 'Entry not found' });
    res.json({ message: 'Entry deleted' });
  } catch {
    res.status(500).json({ message: 'Failed to delete journal entry' });
  }
});

module.exports = router;

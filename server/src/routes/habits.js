const express = require('express');
const Habit = require('../models/Habit');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

const todayKey = () => new Date().toISOString().split('T')[0];

const calcStreak = (checkins, frequency) => {
  const set = new Set(checkins);
  if (frequency === 'weekly') {
    let streak = 0;
    const now = new Date();
    for (let i = 0; i < 52; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i * 7);
      const start = new Date(d);
      start.setDate(d.getDate() - d.getDay());
      let hit = false;
      for (let j = 0; j < 7; j++) {
        const day = new Date(start);
        day.setDate(start.getDate() + j);
        if (set.has(day.toISOString().split('T')[0])) hit = true;
      }
      if (hit) streak += 1;
      else break;
    }
    return streak;
  }

  let streak = 0;
  const cursor = new Date();
  const key = cursor.toISOString().split('T')[0];
  if (!set.has(key)) cursor.setDate(cursor.getDate() - 1);
  while (set.has(cursor.toISOString().split('T')[0])) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
};

const withMeta = (habit) => {
  const obj = habit.toObject();
  const streak = calcStreak(obj.checkins, obj.frequency);
  const badges = [];
  if (streak >= 3) badges.push('spark');
  if (streak >= 7) badges.push('flame');
  if (streak >= 21) badges.push('orbit');
  if (obj.checkins.length >= 50) badges.push('legend');
  return { ...obj, streak, badges };
};

router.get('/', async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(habits.map(withMeta));
  } catch {
    res.status(500).json({ message: 'Failed to fetch habits' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, frequency, color } = req.body;
    if (!name) return res.status(400).json({ message: 'Habit name is required' });
    const habit = await Habit.create({
      userId: req.user._id,
      name,
      frequency: frequency || 'daily',
      color: color || '#22d3ee',
    });
    res.status(201).json(withMeta(habit));
  } catch {
    res.status(500).json({ message: 'Failed to create habit' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, userId: req.user._id });
    if (!habit) return res.status(404).json({ message: 'Habit not found' });
    const { name, frequency, color } = req.body;
    if (name !== undefined) habit.name = name;
    if (frequency !== undefined) habit.frequency = frequency;
    if (color !== undefined) habit.color = color;
    await habit.save();
    res.json(withMeta(habit));
  } catch {
    res.status(500).json({ message: 'Failed to update habit' });
  }
});

router.post('/:id/toggle', async (req, res) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, userId: req.user._id });
    if (!habit) return res.status(404).json({ message: 'Habit not found' });
    const date = req.body.date || todayKey();
    const idx = habit.checkins.indexOf(date);
    if (idx >= 0) habit.checkins.splice(idx, 1);
    else habit.checkins.push(date);
    await habit.save();
    res.json(withMeta(habit));
  } catch {
    res.status(500).json({ message: 'Failed to toggle habit' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const habit = await Habit.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!habit) return res.status(404).json({ message: 'Habit not found' });
    res.json({ message: 'Habit deleted' });
  } catch {
    res.status(500).json({ message: 'Failed to delete habit' });
  }
});

module.exports = router;

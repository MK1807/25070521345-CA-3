const express = require('express');
const FocusSession = require('../models/FocusSession');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.post('/', async (req, res) => {
  try {
    const { duration, type } = req.body;
    if (!duration) return res.status(400).json({ message: 'Duration is required' });

    const today = new Date().toISOString().split('T')[0];

    const session = await FocusSession.create({
      userId: req.user._id,
      duration,
      type: type || 'pomodoro',
      date: today,
    });
    res.status(201).json(session);
  } catch (err) {
    res.status(500).json({ message: 'Failed to log focus session' });
  }
});

router.get('/', async (req, res) => {
  try {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split('T')[0]);
    }

    const weekSessions = await FocusSession.find({
      userId: req.user._id,
      date: { $in: days },
    });

    const recent = await FocusSession.find({ userId: req.user._id })
      .sort({ completedAt: -1 })
      .limit(200);

    const stats = days.map((day) => {
      const daySessions = weekSessions.filter((s) => s.date === day && s.type === 'pomodoro');
      const breaks = weekSessions.filter((s) => s.date === day && s.type !== 'pomodoro');
      return {
        date: day,
        sessions: daySessions.length,
        minutes: daySessions.reduce((sum, s) => sum + s.duration, 0),
        breakMinutes: breaks.reduce((sum, s) => sum + s.duration, 0),
      };
    });

    const hours = Array.from({ length: 24 }, (_, hour) => ({ hour, minutes: 0 }));
    recent
      .filter((s) => s.type === 'pomodoro')
      .forEach((s) => {
        const hour = new Date(s.completedAt).getHours();
        hours[hour].minutes += s.duration;
      });

    const peak = hours.reduce((best, h) => (h.minutes > best.minutes ? h : best), hours[0]);

    const focusMinutes = weekSessions
      .filter((s) => s.type === 'pomodoro')
      .reduce((sum, s) => sum + s.duration, 0);
    const breakMinutes = weekSessions
      .filter((s) => s.type !== 'pomodoro')
      .reduce((sum, s) => sum + s.duration, 0);

    const productivityScore = Math.min(
      100,
      Math.round(focusMinutes / 2 + weekSessions.filter((s) => s.type === 'pomodoro').length * 4)
    );

    const totalSessions = weekSessions.filter((s) => s.type === 'pomodoro').length;
    const totalMinutes = focusMinutes;

    res.json({
      stats,
      totalSessions,
      totalMinutes,
      breakMinutes,
      hours,
      peakHour: peak.minutes ? peak.hour : null,
      productivityScore,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch focus data' });
  }
});

module.exports = router;

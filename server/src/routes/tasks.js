const express = require('express');
const Task = require('../models/Task');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch tasks' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, priority, status, tag, color, deadline, subtasks } = req.body;
    if (!title) return res.status(400).json({ message: 'Task title is required' });

    const nextStatus = status || 'todo';
    const task = await Task.create({
      userId: req.user._id,
      title,
      priority: priority || 'medium',
      status: nextStatus,
      completed: nextStatus === 'completed',
      tag: tag || '',
      color: color || '#8B5CF6',
      deadline: deadline || null,
      subtasks: Array.isArray(subtasks) ? subtasks : [],
    });
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create task' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const { title, completed, priority, status, tag, color, deadline, subtasks } = req.body;
    if (title !== undefined) task.title = title;
    if (priority !== undefined) task.priority = priority;
    if (tag !== undefined) task.tag = tag;
    if (color !== undefined) task.color = color;
    if (deadline !== undefined) task.deadline = deadline;
    if (subtasks !== undefined) task.subtasks = subtasks;
    if (status !== undefined) {
      task.status = status;
      task.completed = status === 'completed';
    } else if (completed !== undefined) {
      task.completed = completed;
      task.status = completed ? 'completed' : task.status === 'completed' ? 'todo' : task.status;
    }

    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update task' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete task' });
  }
});

module.exports = router;

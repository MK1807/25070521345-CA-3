const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

const AVATARS = ['orbit', 'ember', 'frost', 'nova', 'lotus', 'pulse'];
const THEMES = ['cyan', 'purple', 'emerald', 'sunset'];

router.patch('/', async (req, res) => {
  try {
    const { displayName, avatar, themeAccent } = req.body;
    const user = await User.findById(req.user._id);
    if (displayName !== undefined) user.displayName = String(displayName).slice(0, 40);
    if (avatar && AVATARS.includes(avatar)) user.avatar = avatar;
    if (themeAccent && THEMES.includes(themeAccent)) user.themeAccent = themeAccent;
    await user.save();
    res.json({ user });
  } catch {
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

router.post('/presets', async (req, res) => {
  try {
    const { name, volumes } = req.body;
    if (!name) return res.status(400).json({ message: 'Preset name is required' });
    const user = await User.findById(req.user._id);
    user.audioPresets.push({
      name,
      volumes: {
        lofi: volumes?.lofi ?? 0,
        rain: volumes?.rain ?? 0,
        cafe: volumes?.cafe ?? 0,
        white: volumes?.white ?? 0,
      },
    });
    await user.save();
    res.status(201).json({ audioPresets: user.audioPresets });
  } catch {
    res.status(500).json({ message: 'Failed to save preset' });
  }
});

router.delete('/presets/:id', async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.audioPresets = user.audioPresets.filter((p) => String(p._id) !== req.params.id);
    await user.save();
    res.json({ audioPresets: user.audioPresets });
  } catch {
    res.status(500).json({ message: 'Failed to delete preset' });
  }
});

module.exports = router;

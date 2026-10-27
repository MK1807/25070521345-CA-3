const mongoose = require('mongoose');

const focusSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    duration: {
      type: Number, // in minutes
      required: true,
    },
    type: {
      type: String,
      enum: ['pomodoro', 'short_break', 'long_break'],
      default: 'pomodoro',
    },
    date: {
      type: String, // "YYYY-MM-DD" for easy grouping
      required: true,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FocusSession', focusSessionSchema);

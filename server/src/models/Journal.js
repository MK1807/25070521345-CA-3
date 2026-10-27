const mongoose = require('mongoose');

const journalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      trim: true,
      maxlength: 120,
      default: 'Untitled reflection',
    },
    content: {
      type: String,
      default: '',
      maxlength: 20000,
    },
    tags: {
      type: [String],
      default: [],
    },
    mood: {
      type: String,
      enum: ['calm', 'focused', 'energized', 'low', 'grateful'],
      default: 'calm',
    },
    date: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Journal', journalSchema);

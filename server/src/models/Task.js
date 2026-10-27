const mongoose = require('mongoose');

const subtaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    done: { type: Boolean, default: false },
  },
  { _id: true }
);

const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: 200,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['todo', 'in_progress', 'completed'],
      default: 'todo',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    tag: {
      type: String,
      trim: true,
      maxlength: 32,
      default: '',
    },
    color: {
      type: String,
      default: '#8B5CF6',
    },
    deadline: {
      type: Date,
      default: null,
    },
    subtasks: {
      type: [subtaskSchema],
      default: [],
    },
  },
  { timestamps: true }
);

taskSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    this.completed = this.status === 'completed';
  } else if (this.isModified('completed')) {
    this.status = this.completed ? 'completed' : this.status === 'completed' ? 'todo' : this.status;
  }
  next();
});

module.exports = mongoose.model('Task', taskSchema);

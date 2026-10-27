const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const audioPresetSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 40 },
    volumes: {
      lofi: { type: Number, default: 0 },
      rain: { type: Number, default: 0 },
      cafe: { type: Number, default: 0 },
      white: { type: Number, default: 0 },
    },
  },
  { _id: true }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
    displayName: {
      type: String,
      trim: true,
      maxlength: 40,
      default: '',
    },
    avatar: {
      type: String,
      default: 'orbit',
    },
    themeAccent: {
      type: String,
      enum: ['cyan', 'purple', 'emerald', 'sunset'],
      default: 'purple',
    },
    audioPresets: {
      type: [audioPresetSchema],
      default: [],
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);

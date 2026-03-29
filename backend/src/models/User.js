const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ── User Schema ────────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema(
  {
    // ── Core identity ───────────────────────────────────────────────────
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [80, 'Name cannot exceed 80 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Never returned in queries by default
    },

    // ── Role & status ───────────────────────────────────────────────────
    role: {
      type: String,
      enum: ['seeker', 'expert', 'admin'],
      default: null, // Set during onboarding
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    banReason: {
      type: String,
      default: null,
    },

    // ── Verification ────────────────────────────────────────────────────
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      select: false,
    },
    emailVerificationExpires: {
      type: Date,
      select: false,
    },

    // ── OAuth ───────────────────────────────────────────────────────────
    oauthProvider: {
      type: String,
      enum: ['local', 'google', 'linkedin'],
      default: 'local',
    },
    oauthId: {
      type: String,
      sparse: true,
    },

    // ── Password reset ──────────────────────────────────────────────────
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },

    // ── Avatar ──────────────────────────────────────────────────────────
    avatar: {
      type: String,
      default: null, // URL to avatar image
    },

    // ── Onboarding ──────────────────────────────────────────────────────
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },

    // ── Activity tracking ───────────────────────────────────────────────
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    loginCount: {
      type: Number,
      default: 0,
    },

    // ── Notification preferences ────────────────────────────────────────
    notificationPreferences: {
      email: { type: Boolean, default: true },
      mentorshipRequests: { type: Boolean, default: true },
      forumReplies: { type: Boolean, default: true },
      resourceUpdates: { type: Boolean, default: false },
    },

    // ── Soft delete ─────────────────────────────────────────────────────
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Indexes ────────────────────────────────────────────────────────────────
userSchema.index({ email: 1 });
userSchema.index({ oauthProvider: 1, oauthId: 1 });
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ createdAt: -1 });

// ── Virtual: profile reference ─────────────────────────────────────────────
userSchema.virtual('profile', {
  ref: 'Profile',
  localField: '_id',
  foreignField: 'user',
  justOne: true,
});

// ── Pre-save: hash password ────────────────────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ── Methods ────────────────────────────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.isDeleted = function () {
  return this.deletedAt !== null;
};

// ── Static: find active non-deleted users ──────────────────────────────────
userSchema.statics.findActive = function (query = {}) {
  return this.find({ ...query, isActive: true, isBanned: false, deletedAt: null });
};

// ── Remove sensitive fields from JSON output ───────────────────────────────
userSchema.methods.toPublicJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.emailVerificationToken;
  delete obj.emailVerificationExpires;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  delete obj.oauthId;
  return obj;
};

const User = mongoose.model('User', userSchema);
module.exports = User;

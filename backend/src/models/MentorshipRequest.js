const mongoose = require('mongoose');

// ── Session Sub-Schema ─────────────────────────────────────────────────────
const sessionSchema = new mongoose.Schema(
  {
    scheduledAt: { type: Date, required: true },
    duration: { type: Number, required: true }, // minutes
    meetingLink: { type: String, default: '' },
    notes: { type: String, default: '' },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled', 'no_show'],
      default: 'scheduled',
    },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// ── Review Sub-Schema ──────────────────────────────────────────────────────
const reviewSchema = new mongoose.Schema(
  {
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, maxlength: 500, default: '' },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

// ── MentorshipRequest Schema ───────────────────────────────────────────────
const mentorshipRequestSchema = new mongoose.Schema(
  {
    // ── Participants ───────────────────────────────────────────────────
    seeker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Seeker is required'],
    },
    expert: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Expert is required'],
    },

    // ── Request details ────────────────────────────────────────────────
    topic: {
      type: String,
      required: [true, 'Topic is required'],
      trim: true,
      maxlength: [150, 'Topic cannot exceed 150 characters'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
    goals: {
      type: String,
      trim: true,
      maxlength: [500, 'Goals cannot exceed 500 characters'],
      default: '',
    },
    preferredMeetingType: {
      type: String,
      enum: ['video', 'audio', 'chat', 'any'],
      default: 'any',
    },

    // ── Status lifecycle ───────────────────────────────────────────────
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'completed', 'cancelled', 'expired'],
      default: 'pending',
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        note: { type: String, default: '' },
      },
    ],

    // ── Response ───────────────────────────────────────────────────────
    responseMessage: {
      type: String,
      maxlength: 500,
      default: '',
    },
    declineReason: {
      type: String,
      maxlength: 300,
      default: '',
    },
    respondedAt: {
      type: Date,
      default: null,
    },

    // ── Sessions ───────────────────────────────────────────────────────
    sessions: [sessionSchema],
    totalSessionsCompleted: {
      type: Number,
      default: 0,
    },

    // ── Reviews ────────────────────────────────────────────────────────
    seekerReview: {
      type: reviewSchema,
      default: null,
    },
    expertReview: {
      type: reviewSchema,
      default: null,
    },

    // ── Expiry ─────────────────────────────────────────────────────────
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },

    // ── Admin flags ────────────────────────────────────────────────────
    isFlagged: {
      type: Boolean,
      default: false,
    },
    flagReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Indexes ────────────────────────────────────────────────────────────────
mentorshipRequestSchema.index({ seeker: 1, status: 1 });
mentorshipRequestSchema.index({ expert: 1, status: 1 });
mentorshipRequestSchema.index({ status: 1, createdAt: -1 });
mentorshipRequestSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL for auto-expire

// ── Virtual: isExpired ─────────────────────────────────────────────────────
mentorshipRequestSchema.virtual('isExpired').get(function () {
  return this.status === 'pending' && this.expiresAt < new Date();
});

// ── Pre-save: track status history ────────────────────────────────────────
mentorshipRequestSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      changedAt: new Date(),
    });
  }
  next();
});

const MentorshipRequest = mongoose.model('MentorshipRequest', mentorshipRequestSchema);
module.exports = MentorshipRequest;

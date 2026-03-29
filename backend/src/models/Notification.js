const mongoose = require('mongoose');

// ── Notification Schema ────────────────────────────────────────────────────
const notificationSchema = new mongoose.Schema(
  {
    // ── Recipient ──────────────────────────────────────────────────────
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient is required'],
    },

    // ── Sender (optional — null for system notifications) ──────────────
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    // ── Notification type ──────────────────────────────────────────────
    type: {
      type: String,
      required: true,
      enum: [
        // Mentorship
        'mentorship_request_received',
        'mentorship_request_accepted',
        'mentorship_request_declined',
        'mentorship_session_scheduled',
        'mentorship_session_reminder',
        'mentorship_review_received',
        // Forum
        'forum_comment_reply',
        'forum_post_upvoted',
        'forum_comment_upvoted',
        'forum_post_featured',
        // Resources
        'resource_approved',
        'resource_rejected',
        // Account
        'email_verified',
        'profile_verified',
        'welcome',
        'password_changed',
        // Admin
        'admin_announcement',
        'content_removed',
        'account_warning',
        'account_banned',
        // System
        'system',
      ],
    },

    // ── Content ────────────────────────────────────────────────────────
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    // ── Reference to associated resource ───────────────────────────────
    referenceType: {
      type: String,
      enum: ['MentorshipRequest', 'ForumPost', 'Resource', 'User', null],
      default: null,
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      refPath: 'referenceType',
    },

    // ── Deep link for frontend ─────────────────────────────────────────
    actionUrl: {
      type: String,
      default: null,
    },

    // ── Status ─────────────────────────────────────────────────────────
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },

    // ── Channel (for future multi-channel support) ─────────────────────
    channel: {
      type: String,
      enum: ['in_app', 'email', 'both'],
      default: 'in_app',
    },
    emailSent: {
      type: Boolean,
      default: false,
    },
    emailSentAt: {
      type: Date,
      default: null,
    },

    // ── Expiry (optional, for ephemeral notifications) ─────────────────
    expiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ────────────────────────────────────────────────────────────────
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, type: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0, sparse: true }); // TTL

// ── Static helpers ─────────────────────────────────────────────────────────
notificationSchema.statics.createNotification = async function ({
  recipient, sender = null, type, title, message,
  referenceType = null, referenceId = null, actionUrl = null,
  channel = 'in_app',
}) {
  return this.create({
    recipient, sender, type, title, message,
    referenceType, referenceId, actionUrl, channel,
  });
};

notificationSchema.statics.markAllRead = function (userId) {
  return this.updateMany(
    { recipient: userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );
};

notificationSchema.statics.getUnreadCount = function (userId) {
  return this.countDocuments({ recipient: userId, isRead: false });
};

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;

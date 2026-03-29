const mongoose = require('mongoose');

// ── Resource Schema ────────────────────────────────────────────────────────
const resourceSchema = new mongoose.Schema(
  {
    // ── Authorship ──────────────────────────────────────────────────────
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Uploader is required'],
    },

    // ── Content ─────────────────────────────────────────────────────────
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: '',
    },
    thumbnail: {
      type: String,
      default: null,
    },

    // ── Resource type & format ───────────────────────────────────────────
    type: {
      type: String,
      required: [true, 'Resource type is required'],
      enum: ['article', 'video', 'pdf', 'link', 'template', 'guide', 'course', 'podcast', 'other'],
    },
    fileUrl: {
      type: String,
      default: null,
    },
    externalUrl: {
      type: String,
      default: null,
    },
    fileSize: {
      type: Number,
      default: null, // bytes
    },
    fileMimeType: {
      type: String,
      default: null,
    },

    // ── Categorization ──────────────────────────────────────────────────
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'career', 'upsc_prep', 'scholarships', 'legal_rights', 'entrepreneurship',
        'technology', 'education', 'mental_health', 'financial_literacy',
        'social_justice', 'skill_development', 'government_schemes', 'other',
      ],
    },
    tags: {
      type: [{ type: String, trim: true, lowercase: true }],
      default: [],
    },
    targetAudience: {
      type: [String],
      enum: ['student', 'professional', 'job_seeker', 'entrepreneur', 'all'],
      default: ['all'],
    },
    difficultyLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'all'],
      default: 'all',
    },
    language: {
      type: String,
      default: 'English',
    },

    // ── Engagement ──────────────────────────────────────────────────────
    downloadCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    upvoteCount: { type: Number, default: 0 },
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    // ── Status & moderation ─────────────────────────────────────────────
    status: {
      type: String,
      enum: ['published', 'draft', 'pending_review', 'removed'],
      default: 'pending_review',
    },
    isFeatured: { type: Boolean, default: false },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    approvedAt: { type: Date, default: null },

    // ── Reports ─────────────────────────────────────────────────────────
    reports: [
      {
        reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        reason: { type: String },
        reportedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Indexes ────────────────────────────────────────────────────────────────
resourceSchema.index({ uploadedBy: 1 });
resourceSchema.index({ category: 1, status: 1 });
resourceSchema.index({ type: 1, status: 1 });
resourceSchema.index({ tags: 1 });
resourceSchema.index({ upvoteCount: -1 });
resourceSchema.index({ downloadCount: -1 });
resourceSchema.index({ isFeatured: 1, status: 1 });
resourceSchema.index({ title: 'text', description: 'text', tags: 'text' });

// ── Pre-save: sync upvote count ────────────────────────────────────────────
resourceSchema.pre('save', function (next) {
  if (this.isModified('upvotes')) {
    this.upvoteCount = this.upvotes.length;
  }
  next();
});

const Resource = mongoose.model('Resource', resourceSchema);
module.exports = Resource;

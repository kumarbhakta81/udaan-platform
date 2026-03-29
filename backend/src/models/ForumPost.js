const mongoose = require('mongoose');

// ── Comment Sub-Schema ─────────────────────────────────────────────────────
const commentSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      trim: true,
      maxlength: [2000, 'Comment cannot exceed 2000 characters'],
    },
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isEdited: { type: Boolean, default: false },
    editedAt: { type: Date, default: null },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    // Nested replies (one level deep only)
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
  },
  { timestamps: true }
);

// ── ForumPost Schema ───────────────────────────────────────────────────────
const forumPostSchema = new mongoose.Schema(
  {
    // ── Authorship ──────────────────────────────────────────────────────
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required'],
    },

    // ── Content ─────────────────────────────────────────────────────────
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      trim: true,
      minlength: [10, 'Content must be at least 10 characters'],
      maxlength: [10000, 'Content cannot exceed 10000 characters'],
    },
    excerpt: {
      type: String,
      maxlength: 300,
      default: '',
    },

    // ── Categorization ──────────────────────────────────────────────────
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'general', 'career_advice', 'success_stories', 'ask_mentor',
        'resources', 'events', 'introductions', 'opportunities', 'announcements',
      ],
      default: 'general',
    },
    tags: {
      type: [{ type: String, trim: true, lowercase: true }],
      default: [],
    },

    // ── Media ───────────────────────────────────────────────────────────
    images: {
      type: [String],
      default: [],
    },

    // ── Engagement ──────────────────────────────────────────────────────
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    upvoteCount: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    comments: [commentSchema],
    commentCount: { type: Number, default: 0 },
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    // ── Status & moderation ─────────────────────────────────────────────
    status: {
      type: String,
      enum: ['published', 'draft', 'removed', 'pending_review'],
      default: 'published',
    },
    isPinned: { type: Boolean, default: false },
    isLocked: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },

    // ── Moderation ──────────────────────────────────────────────────────
    reports: [
      {
        reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        reason: { type: String, required: true },
        reportedAt: { type: Date, default: Date.now },
      },
    ],
    reportCount: { type: Number, default: 0 },

    // ── Slug for URLs ───────────────────────────────────────────────────
    slug: {
      type: String,
      unique: true,
      sparse: true,
    },

    // ── Soft delete ─────────────────────────────────────────────────────
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Indexes ────────────────────────────────────────────────────────────────
forumPostSchema.index({ author: 1, createdAt: -1 });
forumPostSchema.index({ category: 1, status: 1 });
forumPostSchema.index({ tags: 1 });
forumPostSchema.index({ upvoteCount: -1, createdAt: -1 });
forumPostSchema.index({ status: 1, isPinned: -1, createdAt: -1 });
forumPostSchema.index({ slug: 1 });
forumPostSchema.index({ title: 'text', content: 'text', tags: 'text' }); // Full-text search

// ── Pre-save: generate slug & excerpt ─────────────────────────────────────
forumPostSchema.pre('save', function (next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 80) + '-' + Date.now();
  }
  if (this.isModified('content') && !this.excerpt) {
    this.excerpt = this.content.substring(0, 200).replace(/<[^>]+>/g, '') + '...';
  }
  if (this.isModified('upvotes')) {
    this.upvoteCount = this.upvotes.length;
  }
  if (this.isModified('comments')) {
    this.commentCount = this.comments.filter(c => !c.isDeleted).length;
  }
  next();
});

const ForumPost = mongoose.model('ForumPost', forumPostSchema);
module.exports = ForumPost;

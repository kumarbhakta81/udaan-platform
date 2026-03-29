const mongoose = require('mongoose');

// ── Social Links Sub-Schema ────────────────────────────────────────────────
const socialLinksSchema = new mongoose.Schema(
  {
    linkedin: { type: String, default: '' },
    twitter: { type: String, default: '' },
    github: { type: String, default: '' },
    website: { type: String, default: '' },
  },
  { _id: false }
);

// ── Availability Slot Sub-Schema ───────────────────────────────────────────
const availabilitySlotSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      required: true,
    },
    startTime: { type: String, required: true }, // e.g. "09:00"
    endTime: { type: String, required: true },   // e.g. "11:00"
  },
  { _id: false }
);

// ── Work Experience Sub-Schema ─────────────────────────────────────────────
const experienceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    location: { type: String, trim: true },
    startDate: { type: Date },
    endDate: { type: Date, default: null }, // null = current
    isCurrent: { type: Boolean, default: false },
    description: { type: String, maxlength: 500 },
  },
  { _id: true }
);

// ── Education Sub-Schema ───────────────────────────────────────────────────
const educationSchema = new mongoose.Schema(
  {
    institution: { type: String, required: true, trim: true },
    degree: { type: String, trim: true },
    fieldOfStudy: { type: String, trim: true },
    startYear: { type: Number },
    endYear: { type: Number },
    isCurrent: { type: Boolean, default: false },
  },
  { _id: true }
);

// ── Profile Schema ─────────────────────────────────────────────────────────
const profileSchema = new mongoose.Schema(
  {
    // ── Reference ─────────────────────────────────────────────────────
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },

    // ── Basic info ─────────────────────────────────────────────────────
    headline: {
      type: String,
      trim: true,
      maxlength: [120, 'Headline cannot exceed 120 characters'],
      default: '',
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [1000, 'Bio cannot exceed 1000 characters'],
      default: '',
    },
    location: {
      city: { type: String, trim: true, default: '' },
      state: { type: String, trim: true, default: '' },
      country: { type: String, trim: true, default: 'India' },
    },
    language: {
      type: [String],
      default: ['English'],
    },

    // ── Skills & expertise ─────────────────────────────────────────────
    skills: {
      type: [{ type: String, trim: true }],
      default: [],
    },
    expertiseCategories: {
      type: [{ type: String, trim: true }],
      default: [],
    },

    // ── Work experience & education ────────────────────────────────────
    experience: [experienceSchema],
    education: [educationSchema],

    // ── Social links ───────────────────────────────────────────────────
    socialLinks: {
      type: socialLinksSchema,
      default: () => ({}),
    },

    // ── Expert-specific fields ─────────────────────────────────────────
    isAvailableForMentoring: {
      type: Boolean,
      default: false,
    },
    availabilitySlots: [availabilitySlotSchema],
    sessionDuration: {
      type: Number,
      default: 30, // minutes
      enum: [30, 45, 60, 90],
    },
    maxMenteesPerMonth: {
      type: Number,
      default: 5,
    },
    mentoringTopics: {
      type: [String],
      default: [],
    },
    yearsOfExperience: {
      type: Number,
      min: 0,
      max: 50,
      default: 0,
    },
    currentRole: {
      type: String,
      trim: true,
      default: '',
    },
    currentOrganization: {
      type: String,
      trim: true,
      default: '',
    },

    // ── Expert verification ────────────────────────────────────────────
    isVerifiedExpert: {
      type: Boolean,
      default: false,
    },
    verificationDocuments: {
      type: [String], // Array of document URLs
      select: false,
      default: [],
    },
    verificationStatus: {
      type: String,
      enum: ['not_submitted', 'pending', 'approved', 'rejected'],
      default: 'not_submitted',
    },
    verificationNote: {
      type: String,
      default: '',
    },

    // ── Seeker-specific fields ─────────────────────────────────────────
    seekingHelp: {
      type: [String], // Topics they want help with
      default: [],
    },
    careerGoals: {
      type: String,
      maxlength: [500, 'Career goals cannot exceed 500 characters'],
      default: '',
    },
    currentStatus: {
      type: String,
      enum: ['student', 'job_seeker', 'employed', 'entrepreneur', 'other'],
      default: 'student',
    },

    // ── Stats (denormalized for performance) ───────────────────────────
    stats: {
      totalSessions: { type: Number, default: 0 },
      totalMentees: { type: Number, default: 0 },
      totalMentors: { type: Number, default: 0 },
      averageRating: { type: Number, default: 0, min: 0, max: 5 },
      totalReviews: { type: Number, default: 0 },
      responseRate: { type: Number, default: 100, min: 0, max: 100 },
    },

    // ── Profile completion ─────────────────────────────────────────────
    completionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // ── Visibility ─────────────────────────────────────────────────────
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Indexes ────────────────────────────────────────────────────────────────
profileSchema.index({ user: 1 });
profileSchema.index({ isAvailableForMentoring: 1, isVerifiedExpert: 1 });
profileSchema.index({ expertiseCategories: 1 });
profileSchema.index({ skills: 1 });
profileSchema.index({ 'stats.averageRating': -1 });
profileSchema.index({ 'location.country': 1, 'location.state': 1 });

// ── Method: compute completion percentage ──────────────────────────────────
profileSchema.methods.computeCompletion = function (role) {
  const fields = ['bio', 'headline', 'skills'];
  const expertFields = ['currentRole', 'currentOrganization', 'mentoringTopics', 'experience'];
  const seekerFields = ['careerGoals', 'seekingHelp'];

  const allFields = role === 'expert'
    ? [...fields, ...expertFields]
    : [...fields, ...seekerFields];

  const completed = allFields.filter((f) => {
    const v = this[f];
    return Array.isArray(v) ? v.length > 0 : Boolean(v);
  });

  return Math.round((completed.length / allFields.length) * 100);
};

const Profile = mongoose.model('Profile', profileSchema);
module.exports = Profile;

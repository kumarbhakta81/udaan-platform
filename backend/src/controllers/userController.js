const User = require('../models/User');
const Profile = require('../models/Profile');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// ── Get current user profile ───────────────────────────────────────────────
const getMyProfile = asyncHandler(async (req, res) => {
  const profile = await Profile.findOne({ user: req.user._id });
  res.json(new ApiResponse(200, { user: req.user.toPublicJSON(), profile }, 'Profile fetched'));
});

// ── Update current user profile ────────────────────────────────────────────
const updateMyProfile = asyncHandler(async (req, res) => {
  const allowedFields = [
    'headline', 'bio', 'location', 'languages', 'skills',
    'expertiseCategories', 'seekingHelp', 'socialLinks',
    'isAvailableForMentoring', 'availabilitySlots', 'sessionDuration',
    'maxMenteesPerMonth', 'mentoringTopics', 'yearsOfExperience',
    'careerGoals', 'currentStatus', 'workExperience', 'education',
  ];

  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const profile = await Profile.findOneAndUpdate(
    { user: req.user._id },
    { $set: updates },
    { new: true, runValidators: true, upsert: true }
  );

  res.json(new ApiResponse(200, { profile }, 'Profile updated'));
});

// ── Update user account (name, notifications prefs) ────────────────────────
const updateMyAccount = asyncHandler(async (req, res) => {
  const allowed = ['name', 'notifications'];
  const updates = {};
  allowed.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
  res.json(new ApiResponse(200, { user: user.toPublicJSON() }, 'Account updated'));
});

// ── Get public profile by userId ───────────────────────────────────────────
const getPublicProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId).select('-password -emailVerificationToken -passwordResetToken');
  if (!user || user.isDeleted()) throw ApiError.notFound('User not found');

  const profile = await Profile.findOne({ user: user._id });
  res.json(new ApiResponse(200, { user: user.toPublicJSON(), profile }, 'Profile fetched'));
});

// ── Upload avatar ──────────────────────────────────────────────────────────
const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('No file uploaded');

  const avatarUrl = `/uploads/${req.file.filename}`;
  await User.findByIdAndUpdate(req.user._id, { avatar: avatarUrl });
  res.json(new ApiResponse(200, { avatarUrl }, 'Avatar uploaded'));
});

// ── Delete account (soft delete) ───────────────────────────────────────────
const deleteMyAccount = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { deletedAt: new Date(), isActive: false });
  res.json(new ApiResponse(200, null, 'Account deleted'));
});

module.exports = { getMyProfile, updateMyProfile, updateMyAccount, getPublicProfile, uploadAvatar, deleteMyAccount };

const User = require('../models/User');
const Profile = require('../models/Profile');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// ── List / search experts ─────────────────────────────────────────────────
const getExperts = asyncHandler(async (req, res) => {
  const {
    category, skills, language, available, search,
    sort = 'rating', page = 1, limit = 12,
  } = req.query;

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;

  // Build profile filter
  const profileFilter = { isVerifiedExpert: true };
  if (category) profileFilter.expertiseCategories = { $in: [category] };
  if (skills) profileFilter.skills = { $in: skills.split(',').map((s) => s.trim()) };
  if (language) profileFilter.languages = { $in: [language] };
  if (available === 'true') profileFilter.isAvailableForMentoring = true;

  // Sort map
  const sortMap = {
    rating: { 'stats.averageRating': -1 },
    sessions: { 'stats.totalSessions': -1 },
    newest: { createdAt: -1 },
  };
  const sortObj = sortMap[sort] || sortMap.rating;

  // If text search, filter by name/headline too
  let userIds;
  if (search) {
    const users = await User.find({
      role: 'expert',
      isActive: true,
      deletedAt: null,
      $or: [
        { name: { $regex: search, $options: 'i' } },
      ],
    }).select('_id');
    userIds = users.map((u) => u._id);

    const profileSearch = await Profile.find({
      headline: { $regex: search, $options: 'i' },
    }).select('user');
    profileSearch.forEach((p) => {
      if (!userIds.some((id) => id.equals(p.user))) userIds.push(p.user);
    });

    profileFilter.user = { $in: userIds };
  } else {
    // Only experts
    const expertUsers = await User.find({ role: 'expert', isActive: true, deletedAt: null }).select('_id');
    profileFilter.user = { $in: expertUsers.map((u) => u._id) };
  }

  const [profiles, total] = await Promise.all([
    Profile.find(profileFilter)
      .populate('user', 'name avatar role createdAt')
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum),
    Profile.countDocuments(profileFilter),
  ]);

  res.json(new ApiResponse(200, {
    experts: profiles,
    pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) },
  }, 'Experts fetched'));
});

// ── Get single expert ─────────────────────────────────────────────────────
const getExpert = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.expertId).select('-password -emailVerificationToken -passwordResetToken');
  if (!user || user.isDeleted() || user.role !== 'expert') throw ApiError.notFound('Expert not found');

  const profile = await Profile.findOne({ user: user._id });
  res.json(new ApiResponse(200, { user: user.toPublicJSON(), profile }, 'Expert fetched'));
});

// ── Submit expert verification docs ──────────────────────────────────────
const submitVerification = asyncHandler(async (req, res) => {
  if (req.user.role !== 'expert') throw ApiError.forbidden('Only experts can submit verification');

  const { documents } = req.body;
  const profile = await Profile.findOneAndUpdate(
    { user: req.user._id },
    {
      verificationStatus: 'pending',
      verificationDocuments: documents || [],
    },
    { new: true }
  );

  res.json(new ApiResponse(200, { profile }, 'Verification submitted'));
});

module.exports = { getExperts, getExpert, submitVerification };

const User = require('../models/User');
const Profile = require('../models/Profile');
const MentorshipRequest = require('../models/MentorshipRequest');
const ForumPost = require('../models/ForumPost');
const Resource = require('../models/Resource');
const Notification = require('../models/Notification');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// ── Dashboard analytics ───────────────────────────────────────────────────
const getDashboard = asyncHandler(async (req, res) => {
  const [
    totalUsers, totalExperts, totalSeekers,
    totalRequests, completedRequests, pendingRequests,
    totalPosts, totalResources,
    recentUsers,
  ] = await Promise.all([
    User.countDocuments({ deletedAt: null }),
    User.countDocuments({ role: 'expert', deletedAt: null }),
    User.countDocuments({ role: 'seeker', deletedAt: null }),
    MentorshipRequest.countDocuments(),
    MentorshipRequest.countDocuments({ status: 'completed' }),
    MentorshipRequest.countDocuments({ status: 'pending' }),
    ForumPost.countDocuments({ status: 'published', deletedAt: null }),
    Resource.countDocuments({ status: 'published' }),
    User.find({ deletedAt: null }).sort({ createdAt: -1 }).limit(5).select('name email role createdAt isActive'),
  ]);

  // Users joined last 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const newUsersThisMonth = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo }, deletedAt: null });

  // Pending moderation items
  const [pendingVerifications, reportedPosts, pendingResources] = await Promise.all([
    Profile.countDocuments({ verificationStatus: 'pending' }),
    ForumPost.countDocuments({ status: 'pending_review' }),
    Resource.countDocuments({ status: 'pending_review' }),
  ]);

  res.json(new ApiResponse(200, {
    stats: {
      totalUsers, totalExperts, totalSeekers,
      totalRequests, completedRequests, pendingRequests,
      totalPosts, totalResources, newUsersThisMonth,
    },
    moderation: { pendingVerifications, reportedPosts, pendingResources },
    recentUsers,
  }, 'Admin dashboard data'));
});

// ── List users ────────────────────────────────────────────────────────────
const getUsers = asyncHandler(async (req, res) => {
  const { role, status, search, page = 1, limit = 20 } = req.query;
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, parseInt(limit));
  const skip = (pageNum - 1) * limitNum;

  const filter = { deletedAt: null };
  if (role) filter.role = role;
  if (status === 'active') filter.isActive = true;
  if (status === 'banned') filter.isBanned = true;
  if (status === 'inactive') filter.isActive = false;
  if (search) filter.$or = [
    { name: { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } },
  ];

  const [users, total] = await Promise.all([
    User.find(filter).select('-password -emailVerificationToken -passwordResetToken')
      .sort({ createdAt: -1 }).skip(skip).limit(limitNum),
    User.countDocuments(filter),
  ]);

  res.json(new ApiResponse(200, {
    users,
    pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) },
  }, 'Users fetched'));
});

// ── Update user status (ban/unban/suspend) ────────────────────────────────
const updateUserStatus = asyncHandler(async (req, res) => {
  const { action, reason } = req.body;
  const user = await User.findById(req.params.userId);
  if (!user) throw ApiError.notFound('User not found');
  if (user.role === 'admin') throw ApiError.forbidden('Cannot modify admin accounts');

  switch (action) {
    case 'ban':
      user.isBanned = true;
      user.banReason = reason || 'Policy violation';
      user.isActive = false;
      break;
    case 'unban':
      user.isBanned = false;
      user.banReason = null;
      user.isActive = true;
      break;
    case 'deactivate':
      user.isActive = false;
      break;
    case 'activate':
      user.isActive = true;
      break;
    default:
      throw ApiError.badRequest('Invalid action');
  }

  await user.save();

  if (action === 'ban') {
    await Notification.createNotification({
      recipient: user._id,
      type: 'account_banned',
      title: 'Account Suspended',
      message: `Your account has been suspended. Reason: ${reason || 'Policy violation'}`,
      channel: 'in_app',
    });
  }

  res.json(new ApiResponse(200, { user: user.toPublicJSON() }, `User ${action}ned`));
});

// ── Verify / reject expert ────────────────────────────────────────────────
const updateExpertVerification = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  if (!['approved', 'rejected'].includes(status)) throw ApiError.badRequest('Invalid status');

  const profile = await Profile.findOne({ user: req.params.userId });
  if (!profile) throw ApiError.notFound('Profile not found');

  profile.verificationStatus = status;
  profile.isVerifiedExpert = status === 'approved';
  await profile.save();

  const notifType = status === 'approved' ? 'profile_verified' : 'content_removed';
  const msg = status === 'approved'
    ? 'Your expert profile has been verified!'
    : `Your verification request was rejected. ${note || ''}`;

  await Notification.createNotification({
    recipient: req.params.userId,
    type: notifType,
    title: status === 'approved' ? 'Expert Verified!' : 'Verification Rejected',
    message: msg,
    channel: 'both',
  });

  res.json(new ApiResponse(200, { profile }, `Expert ${status}`));
});

// ── Moderation: list reported posts ───────────────────────────────────────
const getReportedPosts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, parseInt(limit));
  const skip = (pageNum - 1) * limitNum;

  const filter = { status: 'pending_review' };
  const [posts, total] = await Promise.all([
    ForumPost.find(filter)
      .populate('author', 'name email')
      .populate('reportedBy.user', 'name')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limitNum),
    ForumPost.countDocuments(filter),
  ]);

  res.json(new ApiResponse(200, {
    posts,
    pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) },
  }, 'Reported posts fetched'));
});

// ── Moderate a post (approve/remove/pin/feature) ──────────────────────────
const moderatePost = asyncHandler(async (req, res) => {
  const { action } = req.body;
  const post = await ForumPost.findById(req.params.postId);
  if (!post) throw ApiError.notFound('Post not found');

  switch (action) {
    case 'approve': post.status = 'published'; break;
    case 'remove': post.status = 'removed'; post.deletedAt = new Date(); break;
    case 'pin': post.isPinned = !post.isPinned; break;
    case 'feature': post.isFeatured = !post.isFeatured; break;
    case 'lock': post.isLocked = !post.isLocked; break;
    default: throw ApiError.badRequest('Invalid action');
  }

  await post.save();

  if (action === 'remove') {
    await Notification.createNotification({
      recipient: post.author,
      type: 'content_removed',
      title: 'Post Removed',
      message: `Your post "${post.title}" was removed for violating community guidelines.`,
      channel: 'in_app',
    });
  }

  res.json(new ApiResponse(200, { post }, `Post ${action}d`));
});

// ── Pending resources ─────────────────────────────────────────────────────
const getPendingResources = asyncHandler(async (req, res) => {
  const resources = await Resource.find({ status: 'pending_review' })
    .populate('uploadedBy', 'name email')
    .sort({ createdAt: -1 });
  res.json(new ApiResponse(200, { resources }, 'Pending resources fetched'));
});

// ── Approve / reject resource ─────────────────────────────────────────────
const moderateResource = asyncHandler(async (req, res) => {
  const { action } = req.body;
  const resource = await Resource.findById(req.params.resourceId);
  if (!resource) throw ApiError.notFound('Resource not found');

  if (action === 'approve') {
    resource.status = 'published';
    resource.approvedBy = req.user._id;
    resource.approvedAt = new Date();

    await Notification.createNotification({
      recipient: resource.uploadedBy,
      type: 'resource_approved',
      title: 'Resource Approved',
      message: `Your resource "${resource.title}" is now published.`,
      channel: 'in_app',
    });
  } else if (action === 'reject') {
    resource.status = 'removed';

    await Notification.createNotification({
      recipient: resource.uploadedBy,
      type: 'resource_rejected',
      title: 'Resource Rejected',
      message: `Your resource "${resource.title}" was not approved.`,
      channel: 'in_app',
    });
  } else {
    throw ApiError.badRequest('Invalid action');
  }

  await resource.save();
  res.json(new ApiResponse(200, { resource }, `Resource ${action}d`));
});

// ── Platform analytics ────────────────────────────────────────────────────
const getAnalytics = asyncHandler(async (req, res) => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    weeklySignups, monthlySignups,
    weeklyRequests, monthlyRequests,
    weeklyPosts, monthlyPosts,
    expertsByCategory,
  ] = await Promise.all([
    User.countDocuments({ createdAt: { $gte: sevenDaysAgo }, deletedAt: null }),
    User.countDocuments({ createdAt: { $gte: thirtyDaysAgo }, deletedAt: null }),
    MentorshipRequest.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
    MentorshipRequest.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    ForumPost.countDocuments({ createdAt: { $gte: sevenDaysAgo }, status: 'published' }),
    ForumPost.countDocuments({ createdAt: { $gte: thirtyDaysAgo }, status: 'published' }),
    Profile.aggregate([
      { $match: { isVerifiedExpert: true } },
      { $unwind: '$expertiseCategories' },
      { $group: { _id: '$expertiseCategories', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),
  ]);

  res.json(new ApiResponse(200, {
    signups: { weekly: weeklySignups, monthly: monthlySignups },
    requests: { weekly: weeklyRequests, monthly: monthlyRequests },
    posts: { weekly: weeklyPosts, monthly: monthlyPosts },
    expertsByCategory,
  }, 'Analytics fetched'));
});

module.exports = {
  getDashboard, getUsers, updateUserStatus, updateExpertVerification,
  getReportedPosts, moderatePost, getPendingResources, moderateResource, getAnalytics,
};

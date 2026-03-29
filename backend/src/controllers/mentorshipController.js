const MentorshipRequest = require('../models/MentorshipRequest');
const Profile = require('../models/Profile');
const Notification = require('../models/Notification');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { sendMentorshipRequestEmail } = require('../services/emailService');
const User = require('../models/User');

// ── Send a mentorship request ─────────────────────────────────────────────
const sendRequest = asyncHandler(async (req, res) => {
  const { expertId, topic, message, goals, preferredMeetingType } = req.body;

  if (req.user.role !== 'seeker') throw ApiError.forbidden('Only seekers can send mentorship requests');
  if (req.user._id.toString() === expertId) throw ApiError.badRequest('Cannot send request to yourself');

  const expert = await User.findById(expertId);
  if (!expert || expert.role !== 'expert' || !expert.isActive) throw ApiError.notFound('Expert not found');

  // Check for existing pending request
  const existing = await MentorshipRequest.findOne({
    seeker: req.user._id,
    expert: expertId,
    status: { $in: ['pending', 'accepted'] },
  });
  if (existing) throw ApiError.conflict('You already have an active request with this expert');

  const request = await MentorshipRequest.create({
    seeker: req.user._id,
    expert: expertId,
    topic,
    message,
    goals: goals || [],
    preferredMeetingType: preferredMeetingType || 'any',
  });

  await request.populate([
    { path: 'seeker', select: 'name avatar email' },
    { path: 'expert', select: 'name avatar email' },
  ]);

  // Notify expert
  await Notification.createNotification({
    recipient: expertId,
    sender: req.user._id,
    type: 'mentorship_request_received',
    title: 'New Mentorship Request',
    message: `${req.user.name} sent you a mentorship request on "${topic}"`,
    referenceType: 'MentorshipRequest',
    referenceId: request._id,
    actionUrl: `/dashboard/requests`,
    channel: 'both',
  });

  // Send email (non-blocking)
  sendMentorshipRequestEmail(expert.email, expert.name, req.user.name, topic, message).catch(() => {});

  res.status(201).json(new ApiResponse(201, { request }, 'Request sent successfully'));
});

// ── Get my requests (as seeker or expert) ────────────────────────────────
const getMyRequests = asyncHandler(async (req, res) => {
  const { status, role: queryRole, page = 1, limit = 10 } = req.query;
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, parseInt(limit));
  const skip = (pageNum - 1) * limitNum;

  const isExpert = req.user.role === 'expert' || queryRole === 'expert';
  const filter = isExpert ? { expert: req.user._id } : { seeker: req.user._id };
  if (status) filter.status = status;

  const [requests, total] = await Promise.all([
    MentorshipRequest.find(filter)
      .populate('seeker', 'name avatar')
      .populate('expert', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    MentorshipRequest.countDocuments(filter),
  ]);

  res.json(new ApiResponse(200, {
    requests,
    pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) },
  }, 'Requests fetched'));
});

// ── Get single request ────────────────────────────────────────────────────
const getRequest = asyncHandler(async (req, res) => {
  const request = await MentorshipRequest.findById(req.params.requestId)
    .populate('seeker', 'name avatar email')
    .populate('expert', 'name avatar email');

  if (!request) throw ApiError.notFound('Request not found');

  const userId = req.user._id.toString();
  if (request.seeker._id.toString() !== userId && request.expert._id.toString() !== userId) {
    throw ApiError.forbidden('Access denied');
  }

  res.json(new ApiResponse(200, { request }, 'Request fetched'));
});

// ── Respond to a request (expert only) ───────────────────────────────────
const respondToRequest = asyncHandler(async (req, res) => {
  const { action, responseMessage, declineReason } = req.body;
  if (!['accept', 'decline'].includes(action)) throw ApiError.badRequest('Invalid action');

  const request = await MentorshipRequest.findById(req.params.requestId)
    .populate('seeker', 'name email');

  if (!request) throw ApiError.notFound('Request not found');
  if (request.expert.toString() !== req.user._id.toString()) throw ApiError.forbidden('Not your request');
  if (request.status !== 'pending') throw ApiError.badRequest('Request is no longer pending');

  request.status = action === 'accept' ? 'accepted' : 'declined';
  request.responseMessage = responseMessage;
  if (action === 'decline') request.declineReason = declineReason;
  request.respondedAt = new Date();
  await request.save();

  const notificationType = action === 'accept' ? 'mentorship_request_accepted' : 'mentorship_request_declined';
  const notificationMsg = action === 'accept'
    ? `${req.user.name} accepted your mentorship request on "${request.topic}"`
    : `${req.user.name} declined your mentorship request on "${request.topic}"`;

  await Notification.createNotification({
    recipient: request.seeker._id,
    sender: req.user._id,
    type: notificationType,
    title: action === 'accept' ? 'Request Accepted!' : 'Request Declined',
    message: notificationMsg,
    referenceType: 'MentorshipRequest',
    referenceId: request._id,
    actionUrl: `/dashboard/requests/${request._id}`,
    channel: 'both',
  });

  // Update expert stats
  if (action === 'accept') {
    await Profile.findOneAndUpdate({ user: req.user._id }, { $inc: { 'stats.totalSessions': 1 } });
  }

  res.json(new ApiResponse(200, { request }, `Request ${action}ed`));
});

// ── Cancel a request (seeker only) ───────────────────────────────────────
const cancelRequest = asyncHandler(async (req, res) => {
  const request = await MentorshipRequest.findById(req.params.requestId);
  if (!request) throw ApiError.notFound('Request not found');
  if (request.seeker.toString() !== req.user._id.toString()) throw ApiError.forbidden('Not your request');
  if (!['pending', 'accepted'].includes(request.status)) throw ApiError.badRequest('Cannot cancel this request');

  request.status = 'cancelled';
  await request.save();

  res.json(new ApiResponse(200, { request }, 'Request cancelled'));
});

// ── Submit feedback after completion ─────────────────────────────────────
const submitFeedback = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  if (!rating || rating < 1 || rating > 5) throw ApiError.badRequest('Rating must be 1-5');

  const request = await MentorshipRequest.findById(req.params.requestId);
  if (!request) throw ApiError.notFound('Request not found');

  const userId = req.user._id.toString();
  const isSeeker = request.seeker.toString() === userId;
  const isExpert = request.expert.toString() === userId;

  if (!isSeeker && !isExpert) throw ApiError.forbidden('Access denied');
  if (request.status !== 'accepted') throw ApiError.badRequest('Can only review active/completed requests');

  const reviewField = isSeeker ? 'seekerReview' : 'expertReview';
  request[reviewField] = { rating, comment, createdAt: new Date() };
  request.status = 'completed';
  await request.save();

  // Update expert average rating
  if (isSeeker) {
    const allReviews = await MentorshipRequest.find({
      expert: request.expert,
      'seekerReview.rating': { $exists: true },
    }).select('seekerReview');

    const avg = allReviews.reduce((sum, r) => sum + r.seekerReview.rating, 0) / allReviews.length;
    await Profile.findOneAndUpdate(
      { user: request.expert },
      { 'stats.averageRating': Math.round(avg * 10) / 10, 'stats.totalReviews': allReviews.length }
    );

    // Notify expert
    await Notification.createNotification({
      recipient: request.expert,
      sender: req.user._id,
      type: 'mentorship_session_review_received',
      title: 'New Review Received',
      message: `You received a ${rating}-star review`,
      referenceType: 'MentorshipRequest',
      referenceId: request._id,
      actionUrl: `/profile`,
      channel: 'in_app',
    });
  }

  res.json(new ApiResponse(200, { request }, 'Feedback submitted'));
});

module.exports = { sendRequest, getMyRequests, getRequest, respondToRequest, cancelRequest, submitFeedback };

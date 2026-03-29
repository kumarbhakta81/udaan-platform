const Notification = require('../models/Notification');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// ── Get notifications ─────────────────────────────────────────────────────
const getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, unreadOnly } = req.query;
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, parseInt(limit));
  const skip = (pageNum - 1) * limitNum;

  const filter = { recipient: req.user._id };
  if (unreadOnly === 'true') filter.isRead = false;

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter)
      .populate('sender', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Notification.countDocuments(filter),
    Notification.getUnreadCount(req.user._id),
  ]);

  res.json(new ApiResponse(200, {
    notifications,
    unreadCount,
    pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) },
  }, 'Notifications fetched'));
});

// ── Mark single notification as read ──────────────────────────────────────
const markRead = asyncHandler(async (req, res) => {
  await Notification.findOneAndUpdate(
    { _id: req.params.notificationId, recipient: req.user._id },
    { isRead: true, readAt: new Date() }
  );
  res.json(new ApiResponse(200, null, 'Marked as read'));
});

// ── Mark all as read ──────────────────────────────────────────────────────
const markAllRead = asyncHandler(async (req, res) => {
  await Notification.markAllRead(req.user._id);
  res.json(new ApiResponse(200, null, 'All marked as read'));
});

// ── Get unread count ──────────────────────────────────────────────────────
const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.getUnreadCount(req.user._id);
  res.json(new ApiResponse(200, { count }, 'Unread count fetched'));
});

module.exports = { getNotifications, markRead, markAllRead, getUnreadCount };

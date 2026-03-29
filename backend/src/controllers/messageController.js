const { Message, Conversation } = require('../models/Message');
const MentorshipRequest = require('../models/MentorshipRequest');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// ── Get all conversations for current user ────────────────────────────────
const getConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({ participants: req.user._id })
    .populate('participants', 'name avatar role')
    .populate('lastMessage')
    .sort({ lastMessageAt: -1 });

  res.json(new ApiResponse(200, { conversations }, 'Conversations fetched'));
});

// ── Get or create conversation with another user ──────────────────────────
const getOrCreateConversation = asyncHandler(async (req, res) => {
  const { userId, mentorshipRequestId } = req.body;

  if (userId === req.user._id.toString()) throw ApiError.badRequest('Cannot message yourself');

  // Find existing conversation between these two participants
  let conversation = await Conversation.findOne({
    participants: { $all: [req.user._id, userId], $size: 2 },
  }).populate('participants', 'name avatar role').populate('lastMessage');

  if (!conversation) {
    // Validate: only matched users (accepted mentorship) can message each other
    if (!mentorshipRequestId) {
      const accepted = await MentorshipRequest.findOne({
        $or: [
          { seeker: req.user._id, expert: userId },
          { seeker: userId, expert: req.user._id },
        ],
        status: 'accepted',
      });
      if (!accepted) throw ApiError.forbidden('You can only message users with an accepted mentorship request');
    }

    conversation = await Conversation.create({
      participants: [req.user._id, userId],
      mentorshipRequest: mentorshipRequestId || null,
    });
    await conversation.populate('participants', 'name avatar role');
  }

  res.json(new ApiResponse(200, { conversation }, 'Conversation ready'));
});

// ── Get messages in a conversation ────────────────────────────────────────
const getMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const { page = 1, limit = 30 } = req.query;
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, parseInt(limit));
  const skip = (pageNum - 1) * limitNum;

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) throw ApiError.notFound('Conversation not found');
  if (!conversation.participants.some((p) => p.toString() === req.user._id.toString())) {
    throw ApiError.forbidden('Not a participant');
  }

  const [messages, total] = await Promise.all([
    Message.find({ conversation: conversationId, isDeleted: false })
      .populate('sender', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Message.countDocuments({ conversation: conversationId, isDeleted: false }),
  ]);

  // Mark as read
  await Message.updateMany(
    { conversation: conversationId, readBy: { $ne: req.user._id } },
    { $addToSet: { readBy: req.user._id } }
  );

  // Reset unread count
  conversation.unreadCounts.set(req.user._id.toString(), 0);
  await conversation.save();

  res.json(new ApiResponse(200, {
    messages: messages.reverse(),
    pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) },
  }, 'Messages fetched'));
});

// ── Send a message ────────────────────────────────────────────────────────
const sendMessage = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const { content } = req.body;

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) throw ApiError.notFound('Conversation not found');
  if (!conversation.participants.some((p) => p.toString() === req.user._id.toString())) {
    throw ApiError.forbidden('Not a participant');
  }

  const message = await Message.create({
    conversation: conversationId,
    sender: req.user._id,
    content,
    readBy: [req.user._id],
  });

  await message.populate('sender', 'name avatar');

  // Update conversation last message
  conversation.lastMessage = message._id;
  conversation.lastMessageAt = new Date();

  // Increment unread count for other participants
  conversation.participants.forEach((participantId) => {
    if (participantId.toString() !== req.user._id.toString()) {
      const key = participantId.toString();
      conversation.unreadCounts.set(key, (conversation.unreadCounts.get(key) || 0) + 1);
    }
  });
  await conversation.save();

  // Emit via Socket.io (if io is attached to req)
  const io = req.app.get('io');
  if (io) {
    conversation.participants.forEach((participantId) => {
      if (participantId.toString() !== req.user._id.toString()) {
        io.to(`user_${participantId}`).emit('new_message', {
          conversationId,
          message,
        });
      }
    });
  }

  res.status(201).json(new ApiResponse(201, { message }, 'Message sent'));
});

// ── Report a message ──────────────────────────────────────────────────────
const reportMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const { reason } = req.body;

  const message = await Message.findById(messageId);
  if (!message) throw ApiError.notFound('Message not found');

  const alreadyReported = message.reportedBy.some(
    (r) => r.user && r.user.toString() === req.user._id.toString()
  );
  if (alreadyReported) throw ApiError.conflict('Already reported');

  message.reportedBy.push({ user: req.user._id, reason });
  await message.save();

  res.json(new ApiResponse(200, null, 'Message reported'));
});

module.exports = { getConversations, getOrCreateConversation, getMessages, sendMessage, reportMessage };

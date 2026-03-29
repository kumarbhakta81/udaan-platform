const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, maxlength: 5000 },
  attachments: [{ url: String, name: String, type: String }],
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },
  reportedBy: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, reason: String }],
}, { timestamps: true });

const conversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  mentorshipRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'MentorshipRequest', default: null },
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null },
  lastMessageAt: { type: Date, default: null },
  unreadCounts: {
    type: Map,
    of: Number,
    default: {},
  },
}, { timestamps: true });

conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessageAt: -1 });

const Message = mongoose.model('Message', messageSchema);
const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = { Message, Conversation };

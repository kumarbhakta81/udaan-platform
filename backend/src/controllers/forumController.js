const ForumPost = require('../models/ForumPost');
const Notification = require('../models/Notification');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// ── List posts ────────────────────────────────────────────────────────────
const getPosts = asyncHandler(async (req, res) => {
  const { category, search, sort = 'newest', page = 1, limit = 15, tag } = req.query;
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, parseInt(limit));
  const skip = (pageNum - 1) * limitNum;

  const filter = { status: 'published', deletedAt: null };
  if (category) filter.category = category;
  if (tag) filter.tags = tag;
  if (search) filter.$text = { $search: search };

  const sortMap = {
    newest: { isPinned: -1, createdAt: -1 },
    popular: { isPinned: -1, upvoteCount: -1 },
    active: { isPinned: -1, updatedAt: -1 },
  };
  const sortObj = sortMap[sort] || sortMap.newest;

  const [posts, total] = await Promise.all([
    ForumPost.find(filter)
      .populate('author', 'name avatar role')
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum)
      .select('-comments'),
    ForumPost.countDocuments(filter),
  ]);

  res.json(new ApiResponse(200, {
    posts,
    pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) },
  }, 'Posts fetched'));
});

// ── Get single post ───────────────────────────────────────────────────────
const getPost = asyncHandler(async (req, res) => {
  const post = await ForumPost.findOneAndUpdate(
    { slug: req.params.slug, status: 'published', deletedAt: null },
    { $inc: { views: 1 } },
    { new: true }
  ).populate('author', 'name avatar role')
   .populate('comments.author', 'name avatar');

  if (!post) throw ApiError.notFound('Post not found');
  res.json(new ApiResponse(200, { post }, 'Post fetched'));
});

// ── Create post ───────────────────────────────────────────────────────────
const createPost = asyncHandler(async (req, res) => {
  const { title, content, category, tags } = req.body;

  const post = await ForumPost.create({
    author: req.user._id,
    title,
    content,
    category: category || 'general',
    tags: tags || [],
    status: 'published',
  });

  await post.populate('author', 'name avatar role');
  res.status(201).json(new ApiResponse(201, { post }, 'Post created'));
});

// ── Update post (author only) ─────────────────────────────────────────────
const updatePost = asyncHandler(async (req, res) => {
  const post = await ForumPost.findById(req.params.postId);
  if (!post) throw ApiError.notFound('Post not found');
  if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw ApiError.forbidden('Not authorized');
  }

  const { title, content, category, tags } = req.body;
  if (title) post.title = title;
  if (content) post.content = content;
  if (category) post.category = category;
  if (tags) post.tags = tags;
  await post.save();

  res.json(new ApiResponse(200, { post }, 'Post updated'));
});

// ── Delete post ───────────────────────────────────────────────────────────
const deletePost = asyncHandler(async (req, res) => {
  const post = await ForumPost.findById(req.params.postId);
  if (!post) throw ApiError.notFound('Post not found');
  if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw ApiError.forbidden('Not authorized');
  }

  post.deletedAt = new Date();
  post.status = 'removed';
  await post.save();

  res.json(new ApiResponse(200, null, 'Post deleted'));
});

// ── Upvote / un-upvote post ───────────────────────────────────────────────
const toggleUpvote = asyncHandler(async (req, res) => {
  const post = await ForumPost.findById(req.params.postId);
  if (!post || post.deletedAt) throw ApiError.notFound('Post not found');

  const userId = req.user._id.toString();
  const idx = post.upvotes.findIndex((id) => id.toString() === userId);
  let voted;
  if (idx > -1) {
    post.upvotes.splice(idx, 1);
    voted = false;
  } else {
    post.upvotes.push(req.user._id);
    voted = true;

    if (post.author.toString() !== userId) {
      await Notification.createNotification({
        recipient: post.author,
        sender: req.user._id,
        type: 'forum_post_upvoted',
        title: 'Your post was upvoted',
        message: `${req.user.name} upvoted your post "${post.title}"`,
        referenceType: 'ForumPost',
        referenceId: post._id,
        actionUrl: `/forum/${post.slug}`,
        channel: 'in_app',
      });
    }
  }
  post.upvoteCount = post.upvotes.length;
  await post.save();

  res.json(new ApiResponse(200, { upvoteCount: post.upvoteCount, voted }, voted ? 'Upvoted' : 'Upvote removed'));
});

// ── Add comment ───────────────────────────────────────────────────────────
const addComment = asyncHandler(async (req, res) => {
  const { content, parentComment } = req.body;
  const post = await ForumPost.findById(req.params.postId);
  if (!post || post.deletedAt || post.isLocked) throw ApiError.badRequest('Cannot comment on this post');

  const comment = {
    author: req.user._id,
    content,
    parentComment: parentComment || null,
  };
  post.comments.push(comment);
  post.commentCount = post.comments.filter((c) => !c.deletedAt).length;
  await post.save();
  await post.populate('comments.author', 'name avatar');

  const newComment = post.comments[post.comments.length - 1];

  // Notify post author
  if (post.author.toString() !== req.user._id.toString()) {
    await Notification.createNotification({
      recipient: post.author,
      sender: req.user._id,
      type: 'forum_comment_reply',
      title: 'New comment on your post',
      message: `${req.user.name} commented on "${post.title}"`,
      referenceType: 'ForumPost',
      referenceId: post._id,
      actionUrl: `/forum/${post.slug}`,
      channel: 'in_app',
    });
  }

  res.status(201).json(new ApiResponse(201, { comment: newComment }, 'Comment added'));
});

// ── Report post ───────────────────────────────────────────────────────────
const reportPost = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const post = await ForumPost.findById(req.params.postId);
  if (!post) throw ApiError.notFound('Post not found');

  const alreadyReported = post.reportedBy.some(
    (r) => r.user && r.user.toString() === req.user._id.toString()
  );
  if (alreadyReported) throw ApiError.conflict('Already reported');

  post.reportedBy.push({ user: req.user._id, reason, reportedAt: new Date() });
  if (post.reportedBy.length >= 3) post.status = 'pending_review';
  await post.save();

  res.json(new ApiResponse(200, null, 'Post reported'));
});

// ── Bookmark post ─────────────────────────────────────────────────────────
const toggleBookmark = asyncHandler(async (req, res) => {
  const post = await ForumPost.findById(req.params.postId);
  if (!post || post.deletedAt) throw ApiError.notFound('Post not found');

  const userId = req.user._id.toString();
  const idx = post.bookmarks.findIndex((id) => id.toString() === userId);
  let bookmarked;
  if (idx > -1) {
    post.bookmarks.splice(idx, 1);
    bookmarked = false;
  } else {
    post.bookmarks.push(req.user._id);
    bookmarked = true;
  }
  await post.save();

  res.json(new ApiResponse(200, { bookmarked }, bookmarked ? 'Bookmarked' : 'Bookmark removed'));
});

module.exports = { getPosts, getPost, createPost, updatePost, deletePost, toggleUpvote, addComment, reportPost, toggleBookmark };

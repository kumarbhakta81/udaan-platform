const Resource = require('../models/Resource');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// ── List resources ────────────────────────────────────────────────────────
const getResources = asyncHandler(async (req, res) => {
  const { category, type, search, sort = 'newest', page = 1, limit = 12, tag, audience, level } = req.query;
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, parseInt(limit));
  const skip = (pageNum - 1) * limitNum;

  const filter = { status: 'published' };
  if (category) filter.category = category;
  if (type) filter.type = type;
  if (tag) filter.tags = tag;
  if (audience && audience !== 'all') filter.targetAudience = { $in: [audience, 'all'] };
  if (level && level !== 'all') filter.difficultyLevel = { $in: [level, 'all'] };
  if (search) filter.$text = { $search: search };

  const sortMap = {
    newest: { createdAt: -1 },
    popular: { downloadCount: -1 },
    featured: { isFeatured: -1, createdAt: -1 },
  };
  const sortObj = sortMap[sort] || sortMap.newest;

  const [resources, total] = await Promise.all([
    Resource.find(filter)
      .populate('uploadedBy', 'name avatar')
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum),
    Resource.countDocuments(filter),
  ]);

  res.json(new ApiResponse(200, {
    resources,
    pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) },
  }, 'Resources fetched'));
});

// ── Get single resource ───────────────────────────────────────────────────
const getResource = asyncHandler(async (req, res) => {
  const resource = await Resource.findByIdAndUpdate(
    req.params.resourceId,
    { $inc: { viewCount: 1 } },
    { new: true }
  ).populate('uploadedBy', 'name avatar');

  if (!resource || resource.status !== 'published') throw ApiError.notFound('Resource not found');
  res.json(new ApiResponse(200, { resource }, 'Resource fetched'));
});

// ── Download / track download ─────────────────────────────────────────────
const downloadResource = asyncHandler(async (req, res) => {
  const resource = await Resource.findByIdAndUpdate(
    req.params.resourceId,
    { $inc: { downloadCount: 1 } },
    { new: true }
  );

  if (!resource || resource.status !== 'published') throw ApiError.notFound('Resource not found');
  res.json(new ApiResponse(200, { url: resource.fileUrl || resource.externalUrl }, 'Download URL fetched'));
});

// ── Upvote resource ───────────────────────────────────────────────────────
const toggleUpvote = asyncHandler(async (req, res) => {
  const resource = await Resource.findById(req.params.resourceId);
  if (!resource) throw ApiError.notFound('Resource not found');

  const userId = req.user._id.toString();
  const idx = resource.upvotes.findIndex((id) => id.toString() === userId);
  let voted;
  if (idx > -1) {
    resource.upvotes.splice(idx, 1);
    voted = false;
  } else {
    resource.upvotes.push(req.user._id);
    voted = true;
  }
  resource.upvoteCount = resource.upvotes.length;
  await resource.save();

  res.json(new ApiResponse(200, { upvoteCount: resource.upvoteCount, voted }, voted ? 'Upvoted' : 'Removed'));
});

// ── Bookmark resource ─────────────────────────────────────────────────────
const toggleBookmark = asyncHandler(async (req, res) => {
  const resource = await Resource.findById(req.params.resourceId);
  if (!resource) throw ApiError.notFound('Resource not found');

  const userId = req.user._id.toString();
  const idx = resource.bookmarks.findIndex((id) => id.toString() === userId);
  let bookmarked;
  if (idx > -1) {
    resource.bookmarks.splice(idx, 1);
    bookmarked = false;
  } else {
    resource.bookmarks.push(req.user._id);
    bookmarked = true;
  }
  await resource.save();

  res.json(new ApiResponse(200, { bookmarked }, bookmarked ? 'Bookmarked' : 'Removed'));
});

// ── Create resource (admin/approved users) ────────────────────────────────
const createResource = asyncHandler(async (req, res) => {
  const { title, description, type, category, tags, externalUrl, targetAudience, difficultyLevel, language } = req.body;

  const resource = await Resource.create({
    uploadedBy: req.user._id,
    title,
    description,
    type: type || 'article',
    category: category || 'education',
    tags: tags || [],
    externalUrl,
    targetAudience: targetAudience || 'all',
    difficultyLevel: difficultyLevel || 'all',
    language: language || 'English',
    status: req.user.role === 'admin' ? 'published' : 'pending_review',
  });

  await resource.populate('uploadedBy', 'name avatar');
  res.status(201).json(new ApiResponse(201, { resource }, 'Resource submitted'));
});

module.exports = { getResources, getResource, downloadResource, toggleUpvote, toggleBookmark, createResource };

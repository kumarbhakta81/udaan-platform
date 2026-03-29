const express = require('express');
const router = express.Router();
const { protect, optionalAuth, requireEmailVerified } = require('../middleware/auth');
const {
  getResources, getResource, downloadResource,
  toggleUpvote, toggleBookmark, createResource,
} = require('../controllers/resourceController');

router.get('/', optionalAuth, getResources);
router.get('/:resourceId', optionalAuth, getResource);

router.use(protect, requireEmailVerified);
router.get('/:resourceId/download', downloadResource);
router.post('/:resourceId/upvote', toggleUpvote);
router.post('/:resourceId/bookmark', toggleBookmark);
router.post('/', createResource);

module.exports = router;

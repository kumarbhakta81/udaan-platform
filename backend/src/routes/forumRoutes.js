const express = require('express');
const router = express.Router();
const { protect, optionalAuth, requireEmailVerified } = require('../middleware/auth');
const {
  getPosts, getPost, createPost, updatePost, deletePost,
  toggleUpvote, addComment, reportPost, toggleBookmark,
} = require('../controllers/forumController');

router.get('/', optionalAuth, getPosts);
router.get('/:slug', optionalAuth, getPost);

router.use(protect, requireEmailVerified);
router.post('/', createPost);
router.put('/:postId', updatePost);
router.delete('/:postId', deletePost);
router.post('/:postId/upvote', toggleUpvote);
router.post('/:postId/comment', addComment);
router.post('/:postId/report', reportPost);
router.post('/:postId/bookmark', toggleBookmark);

module.exports = router;

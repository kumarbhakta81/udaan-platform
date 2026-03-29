const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getDashboard, getUsers, updateUserStatus, updateExpertVerification,
  getReportedPosts, moderatePost, getPendingResources, moderateResource, getAnalytics,
} = require('../controllers/adminController');

router.use(protect, adminOnly);

router.get('/dashboard', getDashboard);
router.get('/analytics', getAnalytics);

router.get('/users', getUsers);
router.put('/users/:userId/status', updateUserStatus);
router.put('/users/:userId/verify-expert', updateExpertVerification);

router.get('/moderation/posts', getReportedPosts);
router.put('/moderation/posts/:postId', moderatePost);
router.get('/moderation/resources', getPendingResources);
router.put('/moderation/resources/:resourceId', moderateResource);

module.exports = router;

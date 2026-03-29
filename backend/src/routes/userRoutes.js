const express = require('express');
const router = express.Router();
const { protect, requireEmailVerified } = require('../middleware/auth');
const {
  getMyProfile, updateMyProfile, updateMyAccount,
  getPublicProfile, uploadAvatar, deleteMyAccount,
} = require('../controllers/userController');

// Public
router.get('/:userId/profile', getPublicProfile);

// Protected
router.use(protect);
router.get('/me', getMyProfile);
router.put('/me/profile', requireEmailVerified, updateMyProfile);
router.put('/me/account', updateMyAccount);
router.delete('/me', deleteMyAccount);

module.exports = router;

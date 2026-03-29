const express = require('express');
const router = express.Router();
const { protect, optionalAuth } = require('../middleware/auth');
const { getExperts, getExpert, submitVerification } = require('../controllers/expertController');

router.get('/', optionalAuth, getExperts);
router.get('/:expertId', optionalAuth, getExpert);
router.post('/verify', protect, submitVerification);

module.exports = router;

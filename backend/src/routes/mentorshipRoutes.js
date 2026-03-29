const express = require('express');
const router = express.Router();
const { protect, requireEmailVerified } = require('../middleware/auth');
const {
  sendRequest, getMyRequests, getRequest,
  respondToRequest, cancelRequest, submitFeedback,
} = require('../controllers/mentorshipController');

router.use(protect, requireEmailVerified);

router.post('/', sendRequest);
router.get('/', getMyRequests);
router.get('/:requestId', getRequest);
router.put('/:requestId/respond', respondToRequest);
router.put('/:requestId/cancel', cancelRequest);
router.post('/:requestId/feedback', submitFeedback);

module.exports = router;

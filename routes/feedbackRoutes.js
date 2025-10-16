const express = require('express');
const router = express.Router();
const { submitFeedback, getMyFeedback } = require('../controllers/feedbackController');
const auth = require('../middleware/authMiddleware');

router.post('/submit', auth, submitFeedback);
router.get('/my', auth, getMyFeedback);

module.exports = router;

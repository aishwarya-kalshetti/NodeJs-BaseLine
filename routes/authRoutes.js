const express = require('express');
const router = express.Router();
const { register, verifyEmail, login, getProfile } = require('../controllers/authController');
const auth = require('../middleware/authMiddleware');

router.post('/register', register);
router.get('/verify/:token', verifyEmail);
router.post('/login', login);
router.get('/profile', auth, getProfile);

module.exports = router;

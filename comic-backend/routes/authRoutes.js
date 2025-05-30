const express = require('express');
const { register, login, getProfile } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware'); // Import protect middleware

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', protect, getProfile); // Protect the profile route

module.exports = router;
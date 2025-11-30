const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/authController');
const { isAuthenticated } = require('../middlewares/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', isAuthenticated, getProfile);

module.exports = router;

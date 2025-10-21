const express = require('express');
const router = express.Router();
const { signup, login } = require('../Controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes
router.post('/signup', signup);
router.post('/login', login);

// Protected test route
router.get('/me', authMiddleware, (req, res) => {
  res.json({ message: 'You are authorized!', user: req.user });
});

module.exports = router;
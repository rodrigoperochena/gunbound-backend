// routes/authRoutes.js
const express = require('express');
const { loginUser, logoutUser } = require('../controllers/authController');

const router = express.Router();

// Login route
router.post('/login', loginUser);

// Logout route
router.post('/logout', logoutUser);

module.exports = router;
// routes/userRoutes.js
const express = require('express');
const { registerUser, checkLastSeenUsers, getUserDetails } = require('../controllers/userController');

const router = express.Router();

// Register route
router.post('/register', registerUser);

// Check users login route
router.get('/last-seen-users', checkLastSeenUsers);

// Get user details route
router.get('/details/:id', getUserDetails)

module.exports = router;
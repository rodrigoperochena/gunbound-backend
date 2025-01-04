// routes/userRoutes.js
const express = require('express');
const { registerUser, getUsers, getUserById, lastSeenUsers } = require('../controllers/userController');

const router = express.Router();

// Register route
router.post('/register', registerUser);

// Fetch all users
router.get('/', getUsers);

// Check users login route
router.get('/last-seen', lastSeenUsers);

// Fetch a single user by ID
router.get('/:id', getUserById)


module.exports = router;
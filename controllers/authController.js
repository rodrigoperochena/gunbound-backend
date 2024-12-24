// controllers/authController.js
const { pool } = require('../utils/db');
const bcrypt = require('bcrypt');

// Login user
const loginUser = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  pool.query(
    'SELECT * FROM user WHERE user = ?',
    [username],
    async (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Database error', error: err });
      }

      if (results.length === 0) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }

      const user = results[0];

      const passwordMatch = await bcrypt.compare(password, user.Password);
      if (!passwordMatch) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }

      // Store user session
      req.session.userId = user.Id;
      req.session.username = user.user;

      res.status(200).json({ message: 'Login successful' });
    }
  );
};

// Logout user
const logoutUser = (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Logout error', error: err });
      }
      res.status(200).json({ message: 'Logout successful' });
    });
  } else {
    res.status(400).json({ message: 'No active session found' });
  }
};

module.exports = { loginUser, logoutUser };
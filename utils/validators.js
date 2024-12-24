// utils/validators.js
const validateLogin = (username, password) => {
  if (!username || !password) {
    return { valid: false, message: 'Username and password are required' };
  }
  return { valid: true };
};

const validateRegistration = (username, email, password, gender, country) => {
  if (!username || !email || !password || !gender || !country) {
    return { valid: false, message: 'All fields are required' };
  }

  if (username.length < 3 || username.length > 20) {
    return { valid: false, message: 'Username must be between 3 and 20 characters' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Invalid email format' };
  }

  if (password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters long' };
  }

  return { valid: true };
};

module.exports = { validateLogin, validateRegistration };
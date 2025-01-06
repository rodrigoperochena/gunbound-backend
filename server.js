// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const { connectDB } = require('./utils/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json()); // Parse incoming JSON requests
app.use(cors({
  origin: [
    'https://formerly-large-man.ngrok-free.app',
    'https://ubuntu-server.balinese-sunfish.ts.net',
    'http://localhost:5173'], // Update for the frontend's origin
  credentials: true,
}));

// Routes
app.use('/api/users', userRoutes);

// Database connection
connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
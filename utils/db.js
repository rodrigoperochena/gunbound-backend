// utils/db.js
require('dotenv').config();
const mysql = require('mysql2');

// Database configuration
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10,
});

// Connect to MySQL database
const connectDB = () => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to MySQL database:', err);
      process.exit(1);
    }
    console.log('Connected to MySQL database');
    connection.release();
  });
};

module.exports = { pool, connectDB };
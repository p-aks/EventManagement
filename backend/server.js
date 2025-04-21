const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Client } = require('pg');
const userRoutes = require('./routes/userRoutes'); // Make sure this file exists for user-related routes
const eventRoutes = require('./routes/eventRoutes');
const { authenticateToken, requireOrganizer } = require('./middleware/auth');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());  // For parsing JSON bodies

// PostgreSQL client setup
const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Connect to PostgreSQL
client.connect().catch(err => console.error('Error connecting to the database', err.stack));

// API Routes
app.use('/api/users', userRoutes);  // User routes (signup, login)
app.use('/api/events', authenticateToken, eventRoutes);  // Event routes (authentication required)
app.use('/api/organizer', authenticateToken, requireOrganizer, eventRoutes);  // Organizer routes

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = client; // Exporting the client for other modules

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Client } = require('pg');
const userRoutes = require('./routes/userRoutes');  // User-related routes
const eventRoutes = require('./routes/eventRoutes');  // Event-related routes
const { authenticateToken, requireOrganizer } = require('./middleware/auth');  // Authentication middleware

dotenv.config();  // Load environment variables

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());  // For parsing application/json

// PostgreSQL client setup
const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Connect to PostgreSQL database
client.connect();

// Routes
app.use('/api/users', userRoutes);  // User-related routes (sign up, login)
app.use('/api/events', authenticateToken, eventRoutes);  // Event-related routes, protected with authentication

// Event Management Routes (Only for Organizers)
app.use('/api/organizer', authenticateToken, requireOrganizer, eventRoutes);  // Protected by 'Organizer' role

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

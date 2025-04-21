const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { Pool } = require('pg');

// Initialize the environment variables
dotenv.config();

// Initialize the Express app
const app = express();

// Middleware
app.use(express.json());  // For parsing application/json
app.use(cors());  // Enable CORS

// Create a PostgreSQL pool connection
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Function to validate event data
const validateEventData = (data) => {
  const { title, description, date, location, ticket_type, organizer_id } = data;

  if (!title || !description || !date || !location || !ticket_type || !organizer_id) {
    throw new Error('Missing required fields');
  }

  if (ticket_type !== 'free' && ticket_type !== 'paid') {
    throw new Error('Invalid ticket type');
  }
};

// Function to create a new event
const createEvent = async (req, res) => {
  const { title, description, date, location, ticket_type, organizer_id } = req.body;

  try {
    // Validate the event data
    validateEventData(req.body);

    const query = `
      INSERT INTO events (title, description, date, location, ticket_type, organizer_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const values = [title, description, date, location, ticket_type, organizer_id];

    const result = await pool.query(query, values);
    const createdEvent = result.rows[0];

    res.status(201).json({ message: 'Event created successfully!', event: createdEvent });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(400).json({ message: 'Failed to create event', error: error.message });
  }
};

// Function to get all events
const getAllEvents = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM events');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error retrieving events:', error);
    res.status(400).json({ message: 'Failed to retrieve events', error: error.message });
  }
};

// Function to get event details by ID
const getEventDetails = async (req, res) => {
  const { eventId } = req.params;

  try {
    const result = await pool.query('SELECT * FROM events WHERE id = $1', [eventId]);
    if (result.rows.length > 0) {
      res.status(200).json(result.rows[0]);
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } catch (error) {
    console.error('Error retrieving event details:', error);
    res.status(400).json({ message: 'Failed to retrieve event details', error: error.message });
  }
};

// Function to RSVP for an event
const rsvpEvent = async (req, res) => {
  const { eventId, userId } = req.body;

  try {
    const query = `
      INSERT INTO rsvps (event_id, user_id)
      VALUES ($1, $2)
      RETURNING *;
    `;
    const values = [eventId, userId];

    const result = await pool.query(query, values);
    res.status(201).json({ message: 'RSVP successful', rsvp: result.rows[0] });
  } catch (error) {
    console.error('Error RSVPing for event:', error);
    res.status(400).json({ message: 'Failed to RSVP for event', error: error.message });
  }
};

// Route for creating an event
app.post('/events', createEvent);  // Use createEvent function for POST requests

// Route for getting all events
app.get('/events', getAllEvents);

// Route for getting event details by ID
app.get('/events/:eventId', getEventDetails);

// Route for RSVPing to an event
app.post('/rsvp', rsvpEvent);

// Connect to PostgreSQL and start the server
const connectDB = () => {
  pool.connect()
    .then(() => {
      console.log('Connected to PostgreSQL');
    })
    .catch((error) => {
      console.error('Failed to connect to PostgreSQL:', error);
    });
};

// Connect to the database
connectDB();

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

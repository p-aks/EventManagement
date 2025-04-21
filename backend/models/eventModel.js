const { Pool } = require('pg');

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
const createEvent = async (eventData) => {
  const { title, description, date, location, ticket_type, organizer_id } = eventData;

  // Validate the event data
  validateEventData(eventData);

  const query = `
    INSERT INTO events (title, description, date, location, ticket_type, organizer_id)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;
  const values = [title, description, date, location, ticket_type, organizer_id];

  try {
    const res = await pool.query(query, values);
    return res.rows[0];  // Return the created event
  } catch (error) {
    console.error('Error creating event:', error);
    throw new Error('Failed to create event');
  }
};

// Function to get all events
const getAllEvents = async () => {
  try {
    const res = await pool.query('SELECT * FROM events');
    return res.rows;
  } catch (error) {
    console.error('Error retrieving events:', error);
    throw new Error('Failed to retrieve events');
  }
};

// Function to get event details by ID
const getEventDetails = async (eventId) => {
  try {
    const res = await pool.query('SELECT * FROM events WHERE id = $1', [eventId]);
    return res.rows[0];
  } catch (error) {
    console.error('Error retrieving event details:', error);
    throw new Error('Failed to retrieve event details');
  }
};

// Function to RSVP for an event
const rsvpEvent = async (eventId, userId) => {
  const query = `
    INSERT INTO rsvps (event_id, user_id)
    VALUES ($1, $2)
    RETURNING *;
  `;
  const values = [eventId, userId];

  try {
    const res = await pool.query(query, values);
    return res.rows[0];  // Return RSVP confirmation
  } catch (error) {
    console.error('Error RSVPing for event:', error);
    throw new Error('Failed to RSVP for event');
  }
};

module.exports = {
  createEvent,
  getAllEvents,
  getEventDetails,
  rsvpEvent,
};

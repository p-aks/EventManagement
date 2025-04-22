const express = require("express");
const cors = require("cors");
const bodyParser = require('body-parser');
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");
const session =require("express-session");
const sendEmailReminder = require('./emailService');
const { google } = require('googleapis');


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;

// Middleware
app.use(cors());
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(bodyParser.json()); 
app.use(express.json());

// PostgreSQL Pool
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// ================= SIGN-UP =================
app.post("/signup", async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const existing = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)",
      [name, email, hashedPassword, role.toLowerCase()]
    );

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during sign-up" });
  }
});

// ================= LOGIN =================
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// ================= EVENT HANDLERS =================

const validateEventData = (data) => {
  const { title, description, date, location, ticket_type, organizer_id } = data;

  if (!title || !description || !date || !location || !ticket_type || !organizer_id) {
    throw new Error("Missing required fields");
  }

  if (ticket_type !== "free" && ticket_type !== "paid") {
    throw new Error("Invalid ticket type");
  }

  if (ticket_type === "paid") {
    if (!data.ticket_quantity || data.ticket_quantity <= 0) {
      throw new Error("Ticket quantity must be greater than 0 for paid events.");
    }
    if (!data.ticket_price || data.ticket_price <= 0) {
      throw new Error("Ticket price must be greater than 0 for paid events.");
    }
  }
};

// Create Event
app.post("/events", async (req, res) => {
  const {
    title,
    description,
    date,
    location,
    ticket_type,
    ticket_quantity,
    ticket_price,
    organizer_id,
  } = req.body;

  try {
    validateEventData(req.body);

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const eventInsertQuery = `
        INSERT INTO events (title, description, date, location, ticket_type, organizer_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id;
      `;
      const eventValues = [title, description, date, location, ticket_type, organizer_id];
      const eventResult = await client.query(eventInsertQuery, eventValues);
      const eventId = eventResult.rows[0].id;

      const ticketInsertQuery = `
        INSERT INTO tickets (event_id, type, price, quantity)
        VALUES ($1, $2, $3, $4);
      `;

      let ticketValues;
      if (ticket_type === "paid") {
        ticketValues = [eventId, ticket_type, ticket_price, ticket_quantity];
      } else {
        ticketValues = [eventId, ticket_type, 0, ticket_quantity || 0];
      }

      await client.query(ticketInsertQuery, ticketValues);

      await client.query("COMMIT");

      res.status(201).json({
        message: "Event and ticket(s) created successfully!",
        eventId,
      });
    } catch (transactionError) {
      await client.query("ROLLBACK");
      throw transactionError;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(400).json({
      message: "Failed to create event and tickets",
      error: error.message,
    });
  }
});

// Get all events
app.get("/events", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM events");
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error retrieving events:", error);
    res.status(400).json({ message: "Failed to retrieve events", error: error.message });
  }
});

// Get single event details
app.get("/events/:eventId", async (req, res) => {
  const { eventId } = req.params;
  try {
    const result = await pool.query("SELECT * FROM events WHERE id = $1", [eventId]);
    if (result.rows.length > 0) {
      res.status(200).json(result.rows[0]);
    } else {
      res.status(404).json({ message: "Event not found" });
    }
  } catch (error) {
    console.error("Error retrieving event details:", error);
    res.status(400).json({ message: "Failed to retrieve event details", error: error.message });
  }
});

//ticket fetching 
app.get("/tickets/event/:eventId", async (req, res) => {
  const { eventId } = req.params;

  try {
    const result = await pool.query(
      "SELECT quantity FROM tickets WHERE event_id = $1",
      [eventId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No tickets found for this event" });
    }

    // Assuming one ticket type per event
    res.status(200).json({ availableTickets: result.rows[0].quantity });
  } catch (error) {
    console.error("Error fetching ticket availability:", error);
    res.status(500).json({ message: "Failed to fetch ticket availability" });
  }
});
// RSVP to event
app.use(session({
  secret: "your_secret_key",
  resave: false,
  saveUninitialized: true,
}));

// Google OAuth2 Setup
const oauth2Client = new google.auth.OAuth2(
  "your-client-id", // Replace with your client ID
  "your-client-secret", // Replace with your client secret
  "http://localhost:5002/oauth2callback" // Replace with your callback URL
);

const calendar = google.calendar({ version: "v3", auth: oauth2Client });

// Google OAuth2 Authorization
app.get("/auth", (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: "https://www.googleapis.com/auth/calendar.events",
    prompt: "consent"
  });
  res.redirect(authUrl);
});

// Google OAuth2 Callback
app.get("/oauth2callback", async (req, res) => {
  try {
    const { code } = req.query;
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    req.session.tokens = tokens;
    res.redirect("/success"); // Redirect to a success page or dashboard
  } catch (error) {
    console.error("OAuth callback error:", error);
    res.status(500).send("Failed to authenticate with Google Calendar.");
  }
});

// Fetch Google Calendar Events
app.get("/google-events", async (req, res) => {
  if (!req.session.tokens) {
    return res.status(401).send("You need to authenticate with Google first.");
  }

  oauth2Client.setCredentials(req.session.tokens);

  try {
    const result = await calendar.events.list({
      calendarId: "primary",
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: "startTime",
    });

    res.json(result.data.items);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).send("Failed to fetch calendar events.");
  }
});
//mail
router.post("/send-reminder", authenticateToken, async (req, res) => {
  const { eventId } = req.body;
  const userId = req.user.id; // Assuming token provides userId

  try {
    // Check if there's a confirmed RSVP for the event
    const rsvpResult = await db.query(
      "SELECT * FROM rsvps WHERE event_id = $1 AND user_id = $2 AND status = 'confirmed'",
      [eventId, userId]
    );

    if (rsvpResult.rows.length === 0) {
      return res.status(404).json({ message: "No confirmed RSVP found for this user." });
    }

    // Fetch the user's email from the users table
    const userResult = await db.query("SELECT email FROM users WHERE id = $1", [userId]);
    const userEmail = userResult.rows[0]?.email;

    if (!userEmail) {
      return res.status(404).json({ message: "User email not found." });
    }

    // Now send the reminder email
    // Assuming you have a function `sendReminderEmail` that sends the email
    await sendReminderEmail(userEmail, eventId);

    // Respond with success message
    res.status(200).json({ message: "Reminder email sent!" });
  } catch (err) {
    console.error("Error in send-reminder:", err);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// RSVP to event
app.post("/rsvp", async (req, res) => {
  const { eventId, userId } = req.body;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Check if already confirmed
    const existing = await client.query(
      "SELECT * FROM rsvps WHERE event_id = $1 AND user_id = $2 AND status = 'confirmed'",
      [eventId, userId]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "You have already RSVP'd to this event." });
    }

    // Find an available ticket
    const ticketRes = await client.query(
      "SELECT * FROM tickets WHERE event_id = $1 AND quantity > 0 LIMIT 1",
      [eventId]
    );

    if (ticketRes.rows.length === 0) {
      return res.status(400).json({ message: "No tickets available for this event." });
    }

    const ticket = ticketRes.rows[0];

    // Insert RSVP
    const rsvpRes = await client.query(
      `INSERT INTO rsvps (event_id, user_id, ticket_id, status)
       VALUES ($1, $2, $3, 'confirmed') RETURNING *`,
      [eventId, userId, ticket.id]
    );

    // Decrease ticket quantity
    await client.query(
      "UPDATE tickets SET quantity = quantity - 1 WHERE id = $1",
      [ticket.id]
    );
    await client.query("COMMIT");

    res.status(201).json({
      message: "RSVP confirmed",
      rsvp: rsvpRes.rows[0],
    });
    console.log(rsvp.status);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("RSVP error:", err);
    res.status(500).json({ message: "Failed to RSVP", error: err.message });
  } finally {
    client.release();
  }
});

// Get RSVP'd events (with Google Calendar button if RSVP is confirmed)
app.get("/rsvp-events", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]; // Extract token from header
  if (!token) return res.status(401).json({ message: "You need to log in to view your events." });

  try {
    // Assuming the token is valid, and we have the userId stored on the token
    const userId = await validateToken(token); // Assume validateToken is a function that validates the token and returns the userId

    const rsvpQuery = `
    SELECT e.*, r.status AS rsvpStatus, t.quantity
    FROM rsvps r
    JOIN events e ON r.event_id = e.event_id
    JOIN tickets t ON r.ticket_id = t.id
    WHERE r.user_id = $1 AND r.status = 'confirmed'
  ` ;
     
    const result = await pool.query(rsvpQuery, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No RSVP'd events found." });
    }

    const events = result.rows.map(event => ({
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.date,
      location: event.location,
      isRSVPConfirmed: event.status === "confirmed",
    }));

    res.status(200).json(events);
  } catch (err) {
    console.error("Error fetching RSVP'd events:", err);
    res.status(500).json({ message: "Error fetching events." });
  }
});

// Add event to Google Calendar
app.post("/add-to-calendar", async (req, res) => {
  const { eventId, userId } = req.body;

  if (!req.session.tokens) {
    return res.status(401).send("You need to authenticate with Google first.");
  }

  oauth2Client.setCredentials(req.session.tokens);

  try {
    const eventQuery = "SELECT * FROM events WHERE id = $1";
    const eventRes = await pool.query(eventQuery, [eventId]);
    const event = eventRes.rows[0];

    if (!event) {
      return res.status(404).send("Event not found.");
    }

    const eventDetails = {
      summary: event.title,
      description: event.description,
      location: event.location,
      start: {
        dateTime: new Date(event.date).toISOString(),
        timeZone: "America/New_York", // Adjust to your timezone
      },
      end: {
        dateTime: new Date(event.date).toISOString(), // Same as start for simplicity
        timeZone: "America/New_York", // Adjust to your timezone
      },
    };

    const calendarResponse = await calendar.events.insert({
      calendarId: "primary",
      resource: eventDetails,
    });

    res.status(200).json({ message: "Event added to Google Calendar!", data: calendarResponse.data });
  } catch (error) {
    console.error("Error adding to Google Calendar:", error);
    res.status(500).send("Failed to add event to Google Calendar.");
  }
});

// Helper function to validate token and get userId (simplified)
const validateToken = async (token) => {
  // Your logic to validate the token and extract the userId
  return "someUserId"; // Example return, replace with actual userId extraction
};

//handle rsvp 
app.post('/confirm-rsvp', async (req, res) => {
  const { eventId, email } = req.body;

  if (!eventId || !email) {
    return res.status(400).send('Missing event ID or email');
  }

  try {
    // Fetch event details using eventId (if necessary)
    // For example: const event = await Event.findById(eventId);
    const event = { title: "Sample Event" }; // Example for demo purposes

    // Send the email reminder
    const subject = `Reminder: ${event.title}`;
    const message = `This is a reminder for the event: ${event.title}. We look forward to seeing you there!`;

    await sendEmailReminder(email, subject, message);

    res.status(200).send('RSVP confirmed and email reminder sent');
  } catch (error) {
    console.error("Error confirming RSVP or sending email:", error);
    res.status(500).send('Error processing RSVP or sending email');
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});

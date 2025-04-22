const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
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
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("RSVP error:", err);
    res.status(500).json({ message: "Failed to RSVP", error: err.message });
  } finally {
    client.release();
  }
});

//Cancel RSVP
app.post("/cancel-rsvp", async (req, res) => {
  const { eventId, userId } = req.body;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const rsvpRes = await client.query(
      "SELECT * FROM rsvps WHERE event_id = $1 AND user_id = $2 AND status = 'confirmed'",
      [eventId, userId]
    );

    if (rsvpRes.rows.length === 0) {
      return res.status(404).json({ message: "No confirmed RSVP found to cancel." });
    }

    const rsvp = rsvpRes.rows[0];

    // Update RSVP status
    await client.query(
      "UPDATE rsvps SET status = 'cancelled' WHERE id = $1",
      [rsvp.id]
    );

    // Increase ticket quantity
    await client.query(
      "UPDATE tickets SET quantity = quantity + 1 WHERE id = $1",
      [rsvp.ticket_id]
    );

    await client.query("COMMIT");

    res.status(200).json({ message: "RSVP cancelled successfully." });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Cancel RSVP error:", err);
    res.status(500).json({ message: "Failed to cancel RSVP", error: err.message });
  } finally {
    client.release();
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});

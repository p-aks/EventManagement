const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const { Client } = require("pg");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// PostgreSQL setup
const client = new Client({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgre@localhost:5432/eventmanagement"
});
client.connect();

// ==================== SIGN-UP ROUTE ====================
app.post("/signup", async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    // Check if user already exists
    const existing = await client.query("SELECT * FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert into DB
    await client.query(
      "INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)",
      [name, email, hashedPassword, role.toLowerCase()]
    );

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during sign-up" });
  }
});

// ==================== LOGIN ROUTE ====================
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await client.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "1h" }
    );

    console.log("Login successful. Role:", user.role);

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

// ==================== START SERVER ====================
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

// middleware/auth.js
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token and extract user info
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Expecting format: Bearer <token>

  if (!token) return res.sendStatus(401); // Unauthorized

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // Forbidden

    req.user = user; // attach user info to request
    next();
  });
};

// Middleware to check for Organizer role
const requireOrganizer = (req, res, next) => {
  if (req.user && req.user.role === 'Organizer') {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied. Organizer only.' });
  }
};

module.exports = {
  authenticateToken,
  requireOrganizer
};

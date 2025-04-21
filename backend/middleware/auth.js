const jwt = require('jsonwebtoken');

// Middleware to verify JWT token and extract user info
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Expecting format: Bearer <token>

  if (!token) {
    return res.status(401).json({ message: 'Token not provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error('JWT verification failed:', err.message); // Helpful for debugging
      return res.status(403).json({ message: 'Invalid or expired token' });
    }

    req.user = user; // Attach decoded user info to request
    next();
  });
};

// Middleware to check for Organizer role
const requireOrganizer = (req, res, next) => {
  if (req.user && req.user.role === 'organizer') {
    return next();
  } else {
    return res.status(403).json({ message: 'Access denied. Organizer only.' });
  }
};

module.exports = {
  authenticateToken,
  requireOrganizer
};

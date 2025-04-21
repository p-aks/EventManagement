const express = require('express');
const router = express.Router();
const {
  createEventController,
  getAllEventsController,
  getEventDetailsController,
  rsvpEventController
} = require('../controllers/eventController');
const { requireOrganizer } = require('../middleware/auth');

// Route to create a new event (only organizers)
router.post('/', requireOrganizer, createEventController);

// Route to get all events
router.get('/', getAllEventsController);

// Route to get event details by ID
router.get('/:eventId', getEventDetailsController);

// Route to RSVP for an event (authenticated user)
router.post('/rsvp', rsvpEventController);

module.exports = router;

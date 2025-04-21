const { createEvent, getAllEvents, getEventDetails, rsvpEvent } = require('../models/eventModel');

// Controller for creating a new event
const createEventController = async (req, res) => {
  try {
    const eventData = {
      ...req.body,
      organizerId: req.user.id  // user info from token middleware
    };
    const newEvent = await createEvent(eventData, organizerId);  // Pass organizerId to model
    res.status(201).json(newEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(400).json({ message: error.message });
  }
};

// Controller to get all events
const getAllEventsController = async (req, res) => {
  try {
    const events = await getAllEvents();
    res.status(200).json(events);
  } catch (error) {
    console.error('Error retrieving events:', error);
    res.status(400).json({ message: error.message });
  }
};

// Controller to get event details by ID
const getEventDetailsController = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await getEventDetails(eventId);

    if (event) {
      res.status(200).json(event);
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } catch (error) {
    console.error('Error retrieving event details:', error);
    res.status(400).json({ message: error.message });
  }
};

// Controller to RSVP for an event
const rsvpEventController = async (req, res) => {
  try {
    const { eventId } = req.body;
    const userId = req.user.id;  // User ID from token

    const rsvp = await rsvpEvent(eventId, userId);
    res.status(200).json(rsvp);
  } catch (error) {
    console.error('Error RSVPing for event:', error);
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createEventController,
  getAllEventsController,
  getEventDetailsController,
  rsvpEventController
};

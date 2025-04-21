import React, { useState, useEffect } from "react";
import axios from "axios";

const EventDetails = ({ eventId }) => {
  const [event, setEvent] = useState(null);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/event/${eventId}`); // Use actual API endpoint
        setEvent(response.data.event);
      } catch (error) {
        console.error("Error fetching event details:", error);
      }
    };

    fetchEventDetails();
  }, [eventId]);

  if (!event) return <div>Loading...</div>;

  return (
    <div className="event-details">
      <h3>{event.event_name}</h3>
      <p>{event.description}</p>
      <p>Date: {event.event_date}</p>
      <p>Location: {event.location}</p>
      <p>Available Tickets: {event.available_tickets}</p>
      <button>RSVP</button>
    </div>
  );
};
export default EventDetails;
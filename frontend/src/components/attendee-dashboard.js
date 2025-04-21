import React, { useState, useEffect } from "react";
import axios from "axios";

const AttendeeDashboard = () => {
  const [rsvpedEvents, setRsvpedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // Fetch RSVP'd events for the attendee
  useEffect(() => {
    const fetchRsvpedEvents = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setMessage("You need to log in to view your events.");
          return;
        }

        const response = await axios.get("http://localhost:5000/api/rsvp-events", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setRsvpedEvents(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching RSVP'd events:", error);
        setMessage("Error fetching events.");
        setLoading(false);
      }
    };

    fetchRsvpedEvents();
  }, []);

  const handleAddToCalendar = (event) => {
    // Sync to Google Calendar logic will go here
    console.log("Syncing event to Google Calendar:", event);
  };

  const handleEmailReminder = (event) => {
    // Trigger email reminder functionality via SendGrid/Nodemailer
    console.log("Sending email reminder for event:", event);
  };

  return (
    <div className="attendee-dashboard">
      <h2>Attendee Dashboard</h2>
      {loading ? (
        <p>Loading your RSVP'd events...</p>
      ) : (
        <div>
          {message && <p>{message}</p>}
          <h3>Your RSVP'd Events</h3>
          {rsvpedEvents.length > 0 ? (
            <ul>
              {rsvpedEvents.map((event) => (
                <li key={event._id} className="event-item">
                  <h4>{event.title}</h4>
                  <p>{event.description}</p>
                  <p>Date: {new Date(event.date).toLocaleString()}</p>
                  <p>Location: {event.location}</p>
                  <p>Ticket Type: {event.ticketType}</p>
                  <button onClick={() => handleAddToCalendar(event)}>
                    Add to Google Calendar
                  </button>
                  <button onClick={() => handleEmailReminder(event)}>
                    Send Email Reminder
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>You haven't RSVP'd to any events yet.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default AttendeeDashboard;

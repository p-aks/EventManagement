import React, { useState, useEffect } from "react";
import axios from "axios";
import EventListing from "./EventListing"; // Component for browsing all events

const AttendeeDashboard = () => {
  const [rsvpedEvents, setRsvpedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [showEventListing, setShowEventListing] = useState(false);

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
    const calendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      event.title
    )}&dates=${formatGoogleCalendarDate(event.date)}/${formatGoogleCalendarDate(
      event.date,
      true
    )}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(
      event.location
    )}`;

    window.open(calendarUrl, "_blank");
  };

  const formatGoogleCalendarDate = (dateStr, isEnd = false) => {
    const date = new Date(dateStr);
    if (isEnd) date.setHours(date.getHours() + 1); // Add 1 hour for end time
    return date.toISOString().replace(/[-:]|\.\d{3}/g, ""); // Format for Google Calendar
  };

  const handleEmailReminder = (event) => {
    console.log("Sending email reminder for event:", event);
    // Add actual email sending logic here (optional)
  };

  const handleViewEvents = () => {
    setShowEventListing(true); // Show all events
  };

  return (
    <div className="attendee-dashboard">
      <h2>Attendee Dashboard</h2>

      <button onClick={handleViewEvents} style={{ marginBottom: "20px" }}>
        View All Events
      </button>

      {showEventListing && <EventListing />} {/* Show event browser */}

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

                  {/* Show Google Calendar button only if RSVP is confirmed */}
                  {event.isRSVPConfirmed && (
                    <button onClick={() => handleAddToCalendar(event)}>
                      Add to Google Calendar
                    </button>
                  )}

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

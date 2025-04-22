import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const EventDetails = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [ticketAvailability, setTicketAvailability] = useState(null);
  const [isRSVPed, setIsRSVPed] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [userId, setUserId] = useState(null);
  const [role, setRole] = useState("");

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    if (storedRole) {
      setRole(storedRole);
    }
  }, []);
  const [rsvpedEvents, setRsvpedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch event details and ticket availability
  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const eventRes = await axios.get(`http://localhost:5002/events/${eventId}`);
        setEvent(eventRes.data);

        const ticketRes = await axios.get(`http://localhost:5002/tickets/event/${eventId}`);
        setTicketAvailability(ticketRes.data.availableTickets);
      } catch (err) {
        console.error("Error fetching event details:", err);
        setError("Failed to load event data.");
      }
    };

    fetchEventDetails();
  }, [eventId]);

  // Get user ID from localStorage
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId && storedUserId !== "null") {
      setUserId(parseInt(storedUserId)); // Ensure it's a number
    }
  }, []);

  // Refresh ticket availability after RSVP or cancel
  const refreshTickets = async () => {
    try {
      const res = await axios.get(`http://localhost:5002/tickets/event/${eventId}`);
      setTicketAvailability(res.data.availableTickets);
    } catch (err) {
      console.error("Error refreshing ticket availability:", err);
    }
  };

  const handleRSVP = async () => {
    const confirmRSVP = window.confirm("Do you confirm your attendance?");
    if (!confirmRSVP) return;

    if (ticketAvailability <= 0) {
      setMessage("Sorry, no tickets available.");
      return;
    }

    if (!userId) {
      setMessage("You must be logged in to RSVP.");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5002/rsvp", {
        eventId: parseInt(eventId),
        userId: parseInt(userId),
      });
      if (res.data.message === "RSVP confirmed") {
        setIsRSVPed(true);
        setMessage(res.data.message);
        await refreshTickets();
        setShowConfirmation(false);
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to RSVP.");
      setShowConfirmation(false);
    }
  };

  const handleCancelRSVP = async () => {
    const confirmCancel = window.confirm("Do you want to cancel your RSVP?");
    if (!confirmCancel) return;

    if (!userId) {
      setMessage("You must be logged in to cancel your RSVP.");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5002/cancel-rsvp", {
        eventId: parseInt(eventId),
        userId: parseInt(userId),
      });
      if (res.data.message === "RSVP cancelled successfully.") {
        setIsRSVPed(false);
        setMessage(res.data.message);
        await refreshTickets();
        setShowConfirmation(false);
      } else {
        setMessage("Failed to cancel RSVP.");
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to cancel RSVP.");
      setShowConfirmation(false);
    }
  };

  // Handle sending email reminder
  const handleEmailReminder = async (event) => {
    try {
      const res = await axios.post("http://localhost:5002/send-email-reminder", {
        eventId: event._id,
        userId: userId,
      });
      if (res.data.message === "Email reminder sent successfully.") {
        alert("Reminder email sent!");
      }
    } catch (error) {
      alert("Failed to send email reminder.");
    }
  };

  // Handle adding event to Google Calendar
  const handleAddToCalendar = (event) => {
    const googleCalendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${event.title}&details=${event.description}&dates=${new Date(event.date).toISOString()}&location=${event.location}`;
    window.open(googleCalendarUrl, "_blank");
  };

  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!event) return <div>Loading event details...</div>;

  return (
    <div className="event-details" style={{ padding: "20px" }}>
    <h2>{event.title}</h2>
    <p>{event.description}</p>
  
    {role ==="organizer"&& (
      <p><strong>Confirmed RSVPs:</strong> {event.confirmed_rsvps || 0}</p>

    )}
  
    {ticketAvailability !== null && (
      <p><strong>Tickets Available:</strong> {ticketAvailability}</p>
    )}
  
    {role === "user" && (
      !showConfirmation ? (
        isRSVPed ? (
          <div>
            <button onClick={handleCancelRSVP} style={{ backgroundColor: "red", color: "white" }}>
              Cancel RSVP
            </button>
            <button onClick={() => handleAddToCalendar(event)} style={{ backgroundColor: "blue", color: "white" }}>
              Add to Google Calendar
            </button>
            <button onClick={() => handleEmailReminder(event)} style={{ backgroundColor: "orange", color: "white" }}>
              Send Email Reminder
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowConfirmation(true)}
            style={{ backgroundColor: "green", color: "white" }}
            disabled={!userId}
          >
            RSVP
          </button>
        )
      ) : (
        <div>
          <button onClick={handleRSVP} style={{ backgroundColor: "green", color: "white", gap: "10px" }}>
            Confirm Attendance
          </button>
          <button onClick={() => setShowConfirmation(false)} style={{ backgroundColor: "gray", color: "white" }}>
            Cancel
          </button>
        </div>
      )
    )}
  
    {message && <p style={{ color: "green", marginTop: "10px" }}>{message}</p>}
  
    {rsvpedEvents.length > 0 && (
      <div>
        <h3>Your RSVP'd Events</h3>
        <ul>
          {rsvpedEvents.map((event) => (
            <li key={event._id} className="event-item">
              <h4>{event.title}</h4>
              <p>{event.description}</p>
              <p>Date: {new Date(event.date).toLocaleString()}</p>
              <p>Location: {event.location}</p>
              <p>Ticket Type: {event.ticketType}</p>
  
              {event.isRSVPConfirmed ? (
                <>
                  <button onClick={() => handleAddToCalendar(event)}>Add to Google Calendar</button>
                  <button onClick={() => handleEmailReminder(event)}>Send Email Reminder</button>
                </>
              ) : (
                <button onClick={() => handleRSVP(event)}>Confirm RSVP</button>
              )}
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
  
  );
};

export default EventDetails;

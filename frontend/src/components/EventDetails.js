import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const EventDetails = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isRSVPed, setIsRSVPed] = useState(false);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (!storedUserId || storedUserId === "undefined") {
      setError("You must be logged in to RSVP.");
      return;
    }
    setUserId(storedUserId);
  }, []);

  useEffect(() => {
    if (!eventId) {
      setError("Invalid event ID");
      return;
    }

    const fetchEventDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/events/${eventId}`);
        setEvent(response.data);
      } catch (error) {
        console.error("Error fetching event details:", error);
        setError("Failed to fetch event details.");
      }
    };

    fetchEventDetails();
  }, [eventId]);

  const handleRSVP = async () => {
    const confirmed = window.confirm("Do you want to RSVP for this event?");
    if (!confirmed) return;

    try {
      const response = await axios.post("http://localhost:5000/rsvp", {
        eventId,
        userId,
      });
      setMessage(response.data.message);
      setIsRSVPed(true);
    } catch (error) {
      console.error("RSVP error:", error);
      setMessage(error.response?.data?.message || "Failed to RSVP");
    }
  };

  const handleCancelRSVP = async () => {
    const confirmed = window.confirm("Are you sure you want to cancel your RSVP?");
    if (!confirmed) return;

    try {
      const response = await axios.post("http://localhost:5000/cancel-rsvp", {
        eventId,
        userId,
      });
      setMessage(response.data.message);
      setIsRSVPed(false);
    } catch (error) {
      console.error("Cancel RSVP error:", error);
      setMessage(error.response?.data?.message || "Failed to cancel RSVP");
    }
  };

  if (error) return <div>{error}</div>;
  if (!event) return <div>Loading...</div>;

  return (
    <div className="event-details">
      <h3>{event.title}</h3>
      <p>{event.description}</p>
      <p><strong>Date:</strong> {new Date(event.date).toLocaleString()}</p>
      <p><strong>Location:</strong> {event.location}</p>
      <p><strong>Ticket Type:</strong> {event.ticket_type}</p>

      {/* Optional: Display if tickets are available */}
      {event.ticket_availability !== undefined && (
        <p><strong>Tickets Available:</strong> {event.ticket_availability}</p>
      )}

      {/* RSVP or Cancel Button with Confirmation */}
      {userId && (
        isRSVPed ? (
          <button onClick={handleCancelRSVP}>Cancel RSVP</button>
        ) : (
          <button onClick={handleRSVP}>RSVP</button>
        )
      )}

      {message && <p style={{ color: "green", marginTop: "10px" }}>{message}</p>}
    </div>
  );
};

export default EventDetails;

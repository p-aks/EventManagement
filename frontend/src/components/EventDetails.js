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

  // Fetch event details + ticket availability
  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const eventRes = await axios.get(`http://localhost:5000/events/${eventId}`);
        setEvent(eventRes.data);

        const ticketRes = await axios.get(`http://localhost:5000/tickets/event/${eventId}`);
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
      setUserId(parseInt(storedUserId)); // ✅ Ensure it's a number
    }
  }, []);

  // Refresh ticket availability after RSVP or cancel
  const refreshTickets = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/tickets/event/${eventId}`);
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
      const res = await axios.post("http://localhost:5000/rsvp", {
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
      const res = await axios.post("http://localhost:5000/cancel-rsvp", {
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

  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!event) return <div>Loading event details...</div>;

  return (
    <div className="event-details" style={{ padding: "20px" }}>
      <h2>{event.title}</h2>
      <p>{event.description}</p>

      {ticketAvailability !== null && (
        <p><strong>Tickets Available:</strong> {ticketAvailability}</p>
      )}

      {!showConfirmation ? (
        isRSVPed ? (
          <button onClick={handleCancelRSVP} style={{ backgroundColor: "red", color: "white" }}>
            Cancel RSVP
          </button>
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
          <button onClick={handleRSVP} style={{ backgroundColor: "green", color: "white" }}>
            Confirm Attendance
          </button>
          <button onClick={() => setShowConfirmation(false)} style={{ backgroundColor: "gray", color: "white" }}>
            Cancel
          </button>
        </div>
      )}

      {message && <p style={{ color: "green", marginTop: "10px" }}>{message}</p>}
    </div>
  );
};

export default EventDetails;

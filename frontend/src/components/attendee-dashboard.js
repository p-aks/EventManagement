import React, { useState, useEffect } from "react";
import axios from "axios";
import EventListing from "./EventListing";

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

        const response = await axios.get("http://localhost:5002/rsvp-events", {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("RSVP Events Response:", response.data); // Debugging the response
        setRsvpedEvents(response.data); // Ensure this includes the RSVP object
        setLoading(false);
      } catch (error) {
        console.error("Error fetching RSVP'd events:", error);
        setMessage("Error fetching events.");
        setLoading(false);
      }
    };

    fetchRsvpedEvents();
  }, []);

  // RSVP confirmation function
  const handleRSVPConfirmation = async (event) => {
    try {
      const token = localStorage.getItem("token");
      const userEmail = localStorage.getItem("userEmail"); // Assuming you have user email stored in localStorage

      if (!token || !userEmail) {
        setMessage("You need to log in to confirm your RSVP.");
        return;
      }

      const response = await axios.post("http://localhost:5002/api/confirm-rsvp", {
        eventId: event._id,
        email: userEmail,
      });

      if (response.status === 201) {
        alert("RSVP confirmed and reminder sent.");

        // Update event status locally
        setRsvpedEvents((prev) =>
          prev.map((e) =>
            e._id === event._id
              ? { ...e, rsvp: { ...e.rsvp, status: "confirmed" } }
              : e
          )
        );
      } else {
        alert("Error confirming RSVP.");
      }
    } catch (error) {
      console.error("RSVP error:", error);
      alert("Something went wrong.");
    }
  };

  const handleViewEvents = () => {
    setShowEventListing(true);
  };

  return (
    <div className="attendee-dashboard">
      <h2>Attendee Dashboard</h2>

      <button onClick={handleViewEvents} style={{ marginBottom: "20px" }}>
        View All Events
      </button>

      {showEventListing && <EventListing />}

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

                  <button onClick={() => handleRSVPConfirmation(event)}>
                    {event.rsvp?.status === "confirmed" ? "RSVP Confirmed" : "Confirm RSVP"}
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

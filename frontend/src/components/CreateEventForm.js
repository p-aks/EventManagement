import React, { useState } from "react";
import axios from "axios";

const CreateEventForm = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [location, setLocation] = useState("");
  const [ticketType, setTicketType] = useState("free");

  const handleSubmit = (e) => {
    e.preventDefault();

    const eventData = { title, description, date:dateTime, location, ticket_type:ticketType,  organizer_id:1};

    // Send data to backend
    axios
      .post("http://localhost:5000/events", eventData)
      .then((response) => {
        alert("✅ Event created successfully!");
        setTitle("");
        setDescription("");
        setDateTime("");
        setLocation("");
      })
      .catch((error) => {
        console.error("Error creating event:", error);
        alert("❌ Failed to create event. Please try again.");
      });
  };

  return (
    <div className="create-event-form">
      <h3>Create Event</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Event Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Event Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Date/Time</label>
          <input
            type="datetime-local"
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Location</label>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          >
            <option value="">Select Location</option>
            <option value="physical">Physical</option>
            <option value="virtual">Virtual</option>
          </select>
        </div>
        <div className="form-group">
          <label>Ticket Type</label>
          <select
            value={ticketType}
            onChange={(e) => setTicketType(e.target.value)}
            required
          >
            <option value="free">Free</option>
            <option value="paid">Paid</option>
          </select>
        </div>
        <button type="submit">Create Event</button>
      </form>
    </div>
  );
};

export default CreateEventForm;

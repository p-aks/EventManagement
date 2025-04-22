import React, { useState } from "react";
import axios from "axios";

const CreateEventForm = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [location, setLocation] = useState("");
  const [ticketType, setTicketType] = useState("free");
  const [ticketQuantity, setTicketQuantity] = useState(0);
  const [ticketPrice, setTicketPrice] = useState(0); // New: for paid ticket price

  const handleSubmit = (e) => {
    e.preventDefault();

    const eventData = {
      title,
      description,
      date: dateTime,
      location,
      ticket_type: ticketType,
      ticket_quantity: Number(ticketQuantity),
      ticket_price: ticketType === "paid" ? Number(ticketPrice) : 0,
      organizer_id: 1, // Replace with dynamic ID if needed
    };

    axios
      .post("http://localhost:5000/events", eventData)
      .then((response) => {
        alert("✅ Event created successfully!");
        setTitle("");
        setDescription("");
        setDateTime("");
        setLocation("");
        setTicketQuantity(0);
        setTicketPrice(0);
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

        {/* Always show ticket quantity */}
        <div className="form-group">
          <label>Ticket Quantity</label>
          <input
            type="number"
            value={ticketQuantity}
            onChange={(e) => setTicketQuantity(e.target.value)}
            min="0"
            required
          />
        </div>

        {/* Only show price field for paid tickets */}
        {ticketType === "paid" && (
          <div className="form-group">
            <label>Ticket Price ($)</label>
            <input
              type="number"
              value={ticketPrice}
              onChange={(e) => setTicketPrice(e.target.value)}
              min="1"
              required
            />
          </div>
        )}

        <button type="submit">Create Event</button>
      </form>
    </div>
  );
};

export default CreateEventForm;

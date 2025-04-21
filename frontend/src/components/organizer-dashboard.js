import React, { useState } from "react";
import "./organizer-dashboard.css";  // You can create this CSS file for styling

const OrganizerDashboard = () => {
  const [selectedTab, setSelectedTab] = useState("createEvent"); // Default tab is "Create Event"

  return (
    <div className="organizer-dashboard">
      <h2>Organizer Dashboard</h2>

      {/* Navigation buttons */}
      <div className="button-group">
        <button onClick={() => setSelectedTab("createEvent")}>Create Event</button>
        <button onClick={() => setSelectedTab("eventListing")}>Event Listing</button>
        <button onClick={() => setSelectedTab("eventDetails")}>Event Details</button>
      </div>

      {/* Conditional rendering based on selected tab */}
      {selectedTab === "createEvent" && <CreateEventForm />}
      {selectedTab === "eventListing" && <EventListing />}
      {selectedTab === "eventDetails" && <EventDetails />}
    </div>
  );
};

// Form to create an event
const CreateEventForm = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [location, setLocation] = useState("");
  const [ticketType, setTicketType] = useState("free");  // default to 'free'

  const handleSubmit = (e) => {
    e.preventDefault();
    // You can add functionality to send this data to the backend
    console.log({
      title,
      description,
      dateTime,
      location,
      ticketType,
    });
    // Reset form after submission
    setTitle("");
    setDescription("");
    setDateTime("");
    setLocation("");
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
          ></textarea>
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
          <select value={location} onChange={(e) => setLocation(e.target.value)} required>
            <option value="">Select Location</option>
            <option value="physical">Physical</option>
            <option value="virtual">Virtual</option>
          </select>
        </div>

        <div className="form-group">
          <label>Ticket Type</label>
          <select value={ticketType} onChange={(e) => setTicketType(e.target.value)} required>
            <option value="free">Free</option>
            <option value="paid">Paid</option>
          </select>
        </div>

        <button type="submit">Create Event</button>
      </form>
    </div>
  );
};

// Display events with filters
const EventListing = () => {
  // This is where you will fetch events from your database and display them
  const events = [
    { id: 1, title: "Sample Event 1", date: "2025-05-01", location: "Virtual", price: "Free" },
    { id: 2, title: "Sample Event 2", date: "2025-06-01", location: "Physical", price: "Paid" },
  ];

  return (
    <div className="event-listing">
      <h3>Event Listing</h3>
      <div className="filter-group">
        <label>Date:</label>
        <input type="date" />
        <label>Location:</label>
        <input type="text" placeholder="Search by location" />
        <label>Price:</label>
        <select>
          <option value="">Select Price</option>
          <option value="free">Free</option>
          <option value="paid">Paid</option>
        </select>
      </div>

      <div className="events">
        {events.map((event) => (
          <div key={event.id} className="event-card">
            <h4>{event.title}</h4>
            <p>{event.date}</p>
            <p>{event.location}</p>
            <p>{event.price}</p>
            <button>View Details</button>
          </div>
        ))}
      </div>
    </div>
  );
};

// Show event details
const EventDetails = () => {
  // Sample event data
  const event = {
    title: "Sample Event 1",
    description: "This is a detailed description of the event.",
    date: "2025-05-01",
    location: "Virtual",
    availableTickets: 100,
  };

  return (
    <div className="event-details">
      <h3>Event Details</h3>
      <h4>{event.title}</h4>
      <p>{event.description}</p>
      <p>Date: {event.date}</p>
      <p>Location: {event.location}</p>
      <p>Available Tickets: {event.availableTickets}</p>
      <button>RSVP</button>
    </div>
  );
};

export default OrganizerDashboard;

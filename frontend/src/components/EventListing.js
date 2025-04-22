import React, { useState, useEffect } from "react";
import axios from "axios";

const EventListing = () => {
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState({ date: "", location: "", price: "" });
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null); // For showing event details

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get("http://localhost:5000/events");
        setEvents(response.data); // Assuming response is an array
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    // Filter only if at least one filter is selected
    if (filter.date || filter.location || filter.price) {
      const result = events.filter((event) => {
        return (
          (filter.date ? event.date.startsWith(filter.date) : true) &&
          (filter.location
            ? event.location.toLowerCase().includes(filter.location.toLowerCase())
            : true) &&
          (filter.price ? event.ticket_type === filter.price : true)
        );
      });
      setFilteredEvents(result);
    } else {
      setFilteredEvents([]); // Initial empty view
    }

    setSelectedEvent(null); // Reset selected event when filters change
  }, [filter, events]);

  const handleFilterChange = (e) => {
    setFilter({
      ...filter,
      [e.target.name]: e.target.value,
    });
  };

  const handleViewDetails = (event) => {
    setSelectedEvent(event);
  };

  return (
    <div className="event-listing">
      <h3>Event Listing</h3>

      {/* Filters */}
      <div className="filter-group">
        <label>Date:</label>
        <input
          type="date"
          name="date"
          value={filter.date}
          onChange={handleFilterChange}
        />
        <label>Location:</label>
        <input
          type="text"
          name="location"
          placeholder="Search by location"
          value={filter.location}
          onChange={handleFilterChange}
        />
        <label>Price:</label>
        <select name="price" value={filter.price} onChange={handleFilterChange}>
          <option value="">Select Price</option>
          <option value="free">Free</option>
          <option value="paid">Paid</option>
        </select>
      </div>

      {/* Events */}
      <div className="events">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => (
            <div key={event.id} className="event-card">
              <h4>{event.title}</h4>
              <p>{new Date(event.date).toLocaleString()}</p>
              <p>{event.location}</p>
              <p>{event.ticket_type}</p>
              <button onClick={() => handleViewDetails(event)}>View Details</button>
            </div>
          ))
        ) : (
          <p>{filter.date || filter.location || filter.price ? "No matching events." : ""}</p>
        )}
      </div>

      {/* Event Details */}
      {selectedEvent && (
        <div className="event-details" style={{ marginTop: "20px" }}>
          <h3>Event Details</h3>
          <p><strong>Title:</strong> {selectedEvent.title}</p>
          <p><strong>Description:</strong> {selectedEvent.description}</p>
          <p><strong>Date:</strong> {new Date(selectedEvent.date).toLocaleString()}</p>
          <p><strong>Location:</strong> {selectedEvent.location}</p>
          <p><strong>Ticket Type:</strong> {selectedEvent.ticket_type}</p>
        </div>
      )}
    </div>
  );
};

export default EventListing;

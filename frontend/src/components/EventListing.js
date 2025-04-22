import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const EventListing = () => {
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState({ date: "", location: "", price: "" });
  const [filteredEvents, setFilteredEvents] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get("http://localhost:5002/events");
        setEvents(response.data.events); // ✅ Accessing array inside object
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    if (filter.date || filter.location || filter.price) {
      const result = events.filter((event) => {
        return (
          (filter.date ? event.date.startsWith(filter.date) : true) &&
          (filter.location
            ? event.location.toLowerCase().includes(filter.location.toLowerCase())
            : true) &&
          (filter.price
            ? event.ticket_type.toLowerCase() === filter.price.toLowerCase()
            : true)
        );
      });
      setFilteredEvents(result);
    } else {
      setFilteredEvents(events); // ✅ Show all events if no filter applied
    }
  }, [filter, events]);

  const handleFilterChange = (e) => {
    setFilter({
      ...filter,
      [e.target.name]: e.target.value,
    });
  };

  const handleViewDetails = (eventId) => {
    navigate(`/event-details/${eventId}`);
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
        <select name="location" value={filter.location} onChange={handleFilterChange}>
          <option value="">Select Location </option>
          <option value="physical">Physical</option>
          <option value="virtual">Virtual</option>
        </select>

        <label>Price:</label>
        <select name="price" value={filter.price} onChange={handleFilterChange}>
          <option value="">Select Type</option>
          <option value="free">Free</option>
          <option value="paid">Paid</option>
        </select>
      </div>

      {/* Events */}
      <div className="events">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => (
            <div
              key={event.id}
              className="event-card"
              style={{
                marginBottom: "20px",
                paddingBottom: "10px",
                borderBottom: "1px solid #ddd",
              }}
            >
              <h4>{event.title}</h4>
              <p><strong>Date:</strong> {new Date(event.date).toLocaleString()}</p>
              <p><strong>Location:</strong> {event.location}</p>
              <p><strong>Price Type:</strong> {event.ticket_type}</p>
              <button
                onClick={() => handleViewDetails(event.id)}
                style={{
                  backgroundColor: "blue",
                  color: "white",
                  padding: "8px 16px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                View Details
              </button>
            </div>
          ))
        ) : (
          <p>No events available.</p>
        )}
      </div>
    </div>
  );
};
export default EventListing;

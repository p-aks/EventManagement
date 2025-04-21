import React, { useState, useEffect } from "react";
import axios from "axios";

const EventListing = () => {
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState({
    date: "",
    location: "",
    price: "",
  });

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get("http://localhost:5000/events");
        setEvents(response.data); // ✅ Backend sends array directly
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, []);

  const handleFilterChange = (e) => {
    setFilter({
      ...filter,
      [e.target.name]: e.target.value,
    });
  };

  const filteredEvents = events.filter((event) => {
    return (
      (filter.date ? event.date.startsWith(filter.date) : true) &&
      (filter.location
        ? event.location.toLowerCase().includes(filter.location.toLowerCase())
        : true) &&
      (filter.price ? event.ticket_type === filter.price : true)
    );
  });

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

      {/* Events Display */}
      <div className="events">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => (
            <div key={event.id} className="event-card">
              <h4>{event.title}</h4>
              <p>Date: {new Date(event.date).toLocaleString()}</p>
              <p>Location: {event.location}</p>
              <p>Price: {event.ticket_type}</p>
              <button>View Details</button>
            </div>
          ))
        ) : (
          <p>No events found matching the filters.</p>
        )}
      </div>
    </div>
  );
};

export default EventListing;

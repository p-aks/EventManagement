import React, { useState, useEffect } from "react";
import axios from "axios";

const EventListing = () => {
  const [events, setEvents] = useState([]); // State to hold the event data
  const [filter, setFilter] = useState({
    date: "",
    location: "",
    price: "",
  });

  useEffect(() => {
    // Fetch events from the backend when the component mounts
    const fetchEvents = async () => {
      try {
        const response = await axios.get("http://localhost:5000/events"); // Replace with your actual endpoint
        setEvents(response.data.events); // Assuming backend returns an array of events
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
      (filter.date ? event.event_date.includes(filter.date) : true) &&
      (filter.location ? event.location.toLowerCase().includes(filter.location.toLowerCase()) : true) &&
      (filter.price ? event.ticket_type === filter.price : true)
    );
  });

  return (
    <div className="event-listing">
      <h3>Event Listing</h3>
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

      <div className="events">
        {filteredEvents.map((event) => (
          <div key={event.id} className="event-card">
            <h4>{event.event_name}</h4>
            <p>{event.event_date}</p>
            <p>{event.location}</p>
            <p>{event.ticket_type}</p>
            <button>View Details</button>
          </div>
        ))}
      </div>
    </div>
  );
};
export default EventListing;
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [filters, setFilters] = useState({
    date: '',
    location: '',
    ticketType: '',
  });

  // Fetch events from the backend
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/events', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          params: filters, // Send filters as query params
        });
        setEvents(response.data);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, [filters]); // Rerun the effect when filters change

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  return (
    <div>
      <h2>Event Listing</h2>
      
      {/* Filter Inputs */}
      <div>
        <label>Date:</label>
        <input
          type="date"
          name="date"
          value={filters.date}
          onChange={handleFilterChange}
        />
        <label>Location:</label>
        <input
          type="text"
          name="location"
          value={filters.location}
          onChange={handleFilterChange}
        />
        <label>Ticket Type:</label>
        <select
          name="ticketType"
          value={filters.ticketType}
          onChange={handleFilterChange}
        >
          <option value="">All</option>
          <option value="free">Free</option>
          <option value="paid">Paid</option>
        </select>
      </div>
      
      {/* Display Events */}
      <div>
        {events.length === 0 ? (
          <p>No events found</p>
        ) : (
          events.map((event) => (
            <div key={event.id}>
              <h3>{event.title}</h3>
              <p>{event.description}</p>
              <p>{event.date}</p>
              <p>{event.location}</p>
              <p>{event.ticketType}</p>
              <button>RSVP</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EventList;

import React, { useState } from 'react';
import axios from 'axios';

const EventCreationForm = () => {
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    ticketType: 'free', // Default to free
  });

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEventData({ ...eventData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token'); // Retrieve token from local storage
      const response = await axios.post(
        'http://localhost:5000/api/organizer/events', // Use the correct endpoint
        eventData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      console.log('Event created:', response.data);
      alert('Event created successfully');
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Error creating event');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Title:</label>
        <input
          type="text"
          name="title"
          value={eventData.title}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Description:</label>
        <textarea
          name="description"
          value={eventData.description}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Date/Time:</label>
        <input
          type="datetime-local"
          name="date"
          value={eventData.date}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Location:</label>
        <input
          type="text"
          name="location"
          value={eventData.location}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Ticket Type:</label>
        <select
          name="ticketType"
          value={eventData.ticketType}
          onChange={handleChange}
        >
          <option value="free">Free</option>
          <option value="paid">Paid</option>
        </select>
      </div>
      <button type="submit">Create Event</button>
    </form>
  );
};

export default EventCreationForm;

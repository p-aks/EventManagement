import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EventDetails = ({ eventId }) => {
  const [event, setEvent] = useState(null);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5000/api/events/${eventId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        setEvent(response.data);
      } catch (error) {
        console.error('Error fetching event details:', error);
      }
    };

    fetchEventDetails();
  }, [eventId]);

  const handleRSVP = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:5000/api/events/${eventId}/rsvp`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      alert('RSVP Successful');
    } catch (error) {
      console.error('Error RSVPing:', error);
    }
  };

  return (
    <div>
      {event ? (
        <>
          <h2>{event.title}</h2>
          <p>{event.description}</p>
          <p>{event.date}</p>
          <p>{event.location}</p>
          <p>Ticket Type: {event.ticketType}</p>
          <button onClick={handleRSVP}>RSVP</button>
        </>
      ) : (
        <p>Loading event details...</p>
      )}
    </div>
  );
};

export default EventDetails;

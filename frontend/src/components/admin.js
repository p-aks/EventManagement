// AdminDashboard.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch event data for the admin
  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in as an admin');
        setLoading(false);
        return;
      }

      const response = await axios.get('http://localhost:5002/admin/dashboard', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setEvents(response.data.events);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load events');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Admin Dashboard</h2>
      <table>
        <thead>
          <tr>
            <th>Event Name</th>
            <th>RSVP Count</th>
            <th>Tickets Sold</th>
            <th>Remaining Tickets</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr key={event.id}>
              <td>{event.title}</td>
              <td>{event.rsvpCount}</td>
              <td>{event.ticketsSold}</td>
              <td>{event.remainingTickets}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;

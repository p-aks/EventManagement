import React, { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom"; // Import Routes and Route
import CreateEventForm from "./CreateEventForm"; // Import components
import EventListing from "./EventListing";
import EventDetails from "./EventDetails";

const OrganizerDashboard = () => {
  const [selectedTab, setSelectedTab] = useState("createEvent"); // Default tab is "Create Event"
  const navigate = useNavigate(); // Using navigate to handle route programmatically
  
  // Navigation function to update selected tab and navigate to the correct route
  const handleTabChange = (tab) => {
    setSelectedTab(tab);
    if (tab === "eventDetails") {
      // Navigate to the event details page programmatically if needed (e.g., when selecting an event from a listing)
      navigate("/organizer-dashboard/event/:eventId"); // Modify with actual eventId
    }
  };
  const downloadPDF = async () => {
    try {
      const response = await fetch('http://localhost:5002/api/export-pdf');
      if (!response.ok) throw new Error('Failed to generate PDF');
  
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
  
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'attendees.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };
  
  return (
    <div className="organizer-dashboard">
      <h2>Organizer Dashboard</h2>

      {/* Navigation buttons */}
      <div className="button-group">
        <button onClick={() => handleTabChange("createEvent")}>Create Event</button>
        <button onClick={() => handleTabChange("eventListing")}>Admin DashBoard</button>
<button onClick={downloadPDF}>Export PDF</button>

      </div>
      {/* Conditional rendering based on selected tab */}
      {selectedTab === "createEvent" && <CreateEventForm />}
      {selectedTab === "eventListing" && <EventListing />}
      {/* Nested Routes for specific event details */}
      <Routes>
        <Route path="event/:eventId" element={<EventDetails />} />
      </Routes>
    </div>
  );
};

export default OrganizerDashboard;

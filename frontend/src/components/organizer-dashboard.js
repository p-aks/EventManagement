import React, { useState } from "react";
import CreateEventForm from "./CreateEventForm"; // Import components
import EventListing from "./EventListing";
import EventDetails from "./EventDetails";

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

export default OrganizerDashboard;

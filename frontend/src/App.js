import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Home from "./components/Home";
import SignUp from "./components/SignUp";
import Login from "./components/Login";
import OrganizerDashboard from "./components/organizer-dashboard";
import EventDetails from "./components/EventDetails";
import AttendeeDashboard from "./components/attendee-dashboard";

// ✅ Reusable private route that checks for required role
const PrivateRoute = ({ element, requiredRole }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const location = useLocation();

  if (!token || !role) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role !== requiredRole) {
    return <Navigate to={`/${role}-dashboard`} replace />;
  }

  return element;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />

        {/* Organizer route */}
        <Route
          path="/organizer-dashboard"
          element={<PrivateRoute requiredRole="organizer" element={<OrganizerDashboard />} />}
        />

        {/* Event details (organizer view) */}
        <Route path="/event-details/:eventId" element={<EventDetails />} />


        {/* Attendee route */}
        <Route
          path="/attendee-dashboard"
          element={<PrivateRoute requiredRole="attendee" element={<AttendeeDashboard />} />}
        />
      </Routes>
    </Router>
  );
}

export default App;

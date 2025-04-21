import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import SignUp from "./components/SignUp";
import Login from "./components/Login";
import OrganizerDashboard from "./components/organizer-dashboard"; // Import the organizer dashboard
import AttendeeDashboard from "./components/attendee-dashboard"; // Import the attendee dashboard
import { useNavigate } from "react-router-dom";

// PrivateRoute component checks authentication and role before rendering the route
const PrivateRoute = ({ element }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // If no token or role is found, redirect to the login page
  if (!token || !role) {
    navigate("/login");
    return null;
  }

  // If the user is an organizer, allow access to the Organizer Dashboard
  if (role === "organizer") {
    return element;
  } 

  // If the user is an attendee, redirect to the attendee dashboard
  if (role === "attendee") {
    navigate("/attendee-dashboard");
    return null;
  }

  // Default case, in case the role is unknown
  navigate("/login");
  return null;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />

        {/* Private route for organizer dashboard */}
        <Route
          path="/organizer-dashboard"
          element={<PrivateRoute element={<OrganizerDashboard />} />}
        />

        {/* Private route for attendee dashboard */}
        <Route
          path="/attendee-dashboard"
          element={<PrivateRoute element={<AttendeeDashboard />} />}
        />
      </Routes>
    </Router>
  );
}

export default App;

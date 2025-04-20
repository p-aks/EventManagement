// src/components/Home.js
import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css"; // You can style this

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <h1>Welcome to the Event Management System</h1>
      <div className="home-buttons">
        <button onClick={() => navigate("/signup")}>Sign Up</button>
        <button onClick={() => navigate("/login")}>Login</button>
      </div>
    </div>
  );
};

export default Home;

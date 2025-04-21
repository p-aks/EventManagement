import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // For routing

  const handleChange = (e) => {
    const { name, value } = e.target;
    name === "email" ? setEmail(value) : setPassword(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const loginData = { email, password };

    try {
      const response = await axios.post("http://localhost:5000/login", loginData);
      console.log("Full login response:", response);

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("role", response.data.user.role);  // Store role for future use
        console.log("User role:", response.data.user.role);
        setMessage(response.data.message || "Login successful");

        setTimeout(() => {
          // Redirect based on role
          if (response.data.user.role === "organizer") {
            navigate("/organizer-dashboard"); // Navigate to organizer dashboard
          } else if (response.data.user.role === "attendee") {
            navigate("/attendee-dashboard"); // Navigate to attendee dashboard
          } else {
            setMessage("Unknown user role");
          }
        }, 1000);
      }
    } catch (err) {
      console.error("Error:", err);
      setMessage(err?.response?.data?.message || "Login failed! Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          value={email}
          onChange={handleChange}
          placeholder="Enter your email"
          required
        />
        <input
          type="password"
          name="password"
          value={password}
          onChange={handleChange}
          placeholder="Enter your password"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      {message && <div className="message">{message}</div>}
    </div>
  );
};

export default Login;

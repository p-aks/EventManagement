import React, { useState } from "react";
import axios from "axios";
import "./Login.css"; // Optional styling

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(""); // For success/error messages
  const [loading, setLoading] = useState(false); // Optional loader

  // Handle email and password input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "email") {
      setEmail(value);
    } else if (name === "password") {
      setPassword(value);
    }
  };

  // Handle form submission (login request)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(""); // Reset message

    const loginData = { email, password };

    try {
      const response = await axios.post("http://localhost:5000/login", loginData);

      // If login is successful
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        setMessage(response.data.message || "Login successful");

        // Redirect to dashboard after a brief pause to show message
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1000); // 1 sec delay to show the message
      }
    } catch (err) {
      console.error("Error:", err);
      if (err.response && err.response.data && err.response.data.message) {
        setMessage(err.response.data.message);
      } else {
        setMessage("Login failed! Please try again.");
      }
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

      {/* Show success or error message */}
      {message && <div className="message">{message}</div>}
    </div>
  );
};

export default Login;

import React, { useState } from "react";
import axios from "axios";
import "./Login.css"; // Optional styling

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // To display errors

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

    // Prepare the login request payload
    const loginData = {
      email,
      password
    };

    try {
      // Make a POST request to the backend API
      const response = await axios.post("http://localhost:5000/login", loginData);

      // If login is successful, the backend should return a JWT token
      if (response.data.token) {
        // Store the token in local storage
        localStorage.setItem("token", response.data.token);

        // Optionally redirect the user (e.g., to a dashboard or home page)
        window.location.href = "/dashboard"; // Change this as per your flow
      }
    } catch (err) {
      // If there's an error, set the error message
      console.error("Error:", err);
      setErrorMessage("Login failed! Please check your credentials.");
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
        <button type="submit">Login</button>
      </form>

      {/* Show error message if login fails */}
      {errorMessage && <div className="error-message">{errorMessage}</div>}
    </div>
  );
};

export default Login;

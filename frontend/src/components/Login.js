import React, { useState } from "react";
import axios from "axios";
import "./Login.css"; // optional styling

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ 
      ...formData, 
      [e.target.name]: e.target.value 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Replace URL with your backend login endpoint
      const response = await axios.post("http://localhost:5000/api/login", formData);
      
      if (response.data.success) {
        alert("Login successful!");
        // Redirect to the dashboard or home page
      } else {
        alert("Invalid credentials");
      }
    } catch (err) {
      console.error(err);
      alert("Login failed! Try again later.");
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit} className="login-form">
        <input 
          type="email" 
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter your email"
          required 
        />

        <input 
          type="password" 
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter your password"
          required 
        />

        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;

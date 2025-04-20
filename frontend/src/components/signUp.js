import React, { useState } from "react";
import axios from "axios";
import "./SignUp.css"; // optional styling

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "attendee",  // default role
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Sending data to the backend signup API using Axios
      const response = await axios.post("http://localhost:5000/signup", formData);

      if (response.status === 201) {
        alert("Sign-up successful!");
        // Optionally, redirect user or clear form
        setFormData({ name: "", email: "", password: "", role: "attendee" });  // Clear the form
      }
    } catch (err) {
      console.error(err);
      alert("Sign-up failed!");
    }
  };

  return (
    <div className="signup-container">
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter your name"
          required 
        />

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

        <select 
          name="role" 
          value={formData.role}
          onChange={handleChange}
        >
          <option value="attendee">Attendee</option>
          <option value="organizer">Organizer</option>
        </select>

        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default SignUp;

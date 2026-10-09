
import React, { useState } from "react";
import "./Register.css";

const Register = () => {
  const [formData, setFormData] = useState({
    userName: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      const response = await fetch("/djangoapp/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage("Registration successful!");
        setFormData({
          userName: "",
          firstName: "",
          lastName: "",
          email: "",
          password: "",
        });
      } else {
        setMessage(result.error || "Registration failed.");
      }
    } catch {
      setMessage("Unable to connect to the server.");
    }
  };

  return (
    <div className="register_container">
      <h1 className="header">Register</h1>

      <form onSubmit={handleSubmit}>
        <div className="inputs">
          <input
            className="input_field"
            type="text"
            name="userName"
            placeholder="Username"
            value={formData.userName}
            onChange={handleChange}
            required
          />

          <input
            className="input_field"
            type="text"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
            required
          />

          <input
            className="input_field"
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            required
          />

          <input
            className="input_field"
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            className="input_field"
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="submit_panel">
          <button className="submit" type="submit">
            Register
          </button>
        </div>
      </form>

      {message && <p role="status">{message}</p>}
    </div>
  );
};

export default Register;

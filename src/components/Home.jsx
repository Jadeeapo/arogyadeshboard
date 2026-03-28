import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import Logo from "./Logo";

const Home = () => {
  const navigateTo = useNavigate();

  return (
    <div className="home-container">
      <div className="home-content">
        <Logo variant="vertical" size="xlarge" showText={true} />

        <h1>Arogya Hospital Management System</h1>
        <p className="tagline">Healthcare Management Excellence</p>

        <div className="login-options">
          <div className="login-card admin-card">
            <div className="card-icon">👨‍💼</div>
            <h2>Admin Portal</h2>
            <p>Manage doctors, patients, appointments, and system settings</p>
            <button onClick={() => navigateTo("/login")} className="login-btn">
              Admin Login
            </button>
          </div>

          <div className="login-card doctor-card">
            <div className="card-icon">👨‍⚕️</div>
            <h2>Doctor Portal</h2>
            <p>View and manage your patient appointments</p>
            <button
              onClick={() => navigateTo("/doctor/login")}
              className="login-btn"
            >
              Doctor Login
            </button>
          </div>
        </div>

        <div className="footer-text">
          <p>© 2024 Arogya Hospital Management System. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;

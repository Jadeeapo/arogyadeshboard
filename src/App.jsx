import React, { useContext, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Home from "./components/Home";
import Login from "./components/Login";
import DoctorLogin from "./components/DoctorLogin";
import DoctorDashboard from "./components/DoctorDashboard";
import AddNewDoctor from "./components/AddNewDoctor";
import Messages from "./components/Messages";
import Doctors from "./components/Doctors";
import { Context } from "./main";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "./components/Sidebar";
import AddNewAdmin from "./components/AddNewAdmin";
import "./App.css";

const App = () => {
  const {
    isAuthenticated,
    setIsAuthenticated,
    admin,
    setAdmin,
    doctor,
    setDoctor,
    setUserRole,
  } = useContext(Context);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Try to fetch as admin
        const adminResponse = await axios.get(
          "https://arogyabackend.onrender.com/api/v1/user/admin/me",
          {
            withCredentials: true,
          }
        );
        setIsAuthenticated(true);
        setAdmin(adminResponse.data.user);
        setUserRole("Admin");
      } catch (error) {
        try {
          // If admin fails, try to fetch as doctor
          const doctorResponse = await axios.get(
            "https://arogyabackend.onrender.com/api/v1/user/doctor/me",
            {
              withCredentials: true,
            }
          );
          setIsAuthenticated(true);
          setDoctor(doctorResponse.data.user);
          setUserRole("Doctor");
        } catch (err) {
          setIsAuthenticated(false);
          setAdmin({});
          setDoctor({});
          setUserRole("");
        }
      }
    };
    fetchUser();
  }, [isAuthenticated]);

  return (
    <Router>
      <Sidebar />
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<Home />} />

        {/* Admin Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/doctor/addnew" element={<AddNewDoctor />} />
        <Route path="/admin/addnew" element={<AddNewAdmin />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/doctors" element={<Doctors />} />

        {/* Doctor Routes */}
        <Route path="/doctor/login" element={<DoctorLogin />} />
        <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
      </Routes>
      <ToastContainer position="top-center" />
    </Router>
  );
};

export default App;
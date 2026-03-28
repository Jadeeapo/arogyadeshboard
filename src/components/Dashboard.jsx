import React, { useContext, useEffect, useState } from "react";
import { Context } from "../main";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { GoCheckCircleFill } from "react-icons/go";
import { AiFillCloseCircle } from "react-icons/ai";
import { FaUsers, FaUserMd, FaCalendarCheck } from "react-icons/fa";
import "./Dashboard.css";

const Dashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    totalDoctors: 0,
    totalPatients: 0,
    pendingAppointments: 0,
  });
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date");

  useEffect(() => {
    fetchAppointments();
    fetchStats();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        "http://localhost:4000/api/v1/appointment/getall",
        { withCredentials: true }
      );
      setAppointments(data.appointments || []);
      toast.success("Appointments loaded");
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error("Failed to load appointments");
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:4000/api/v1/appointment/getall",
        { withCredentials: true }
      );
      const appointmentsList = data.appointments || [];
      
      setStats({
        totalAppointments: appointmentsList.length,
        totalDoctors: new Set(appointmentsList.map(a => a.doctor._id)).size,
        totalPatients: new Set(appointmentsList.map(a => a._id)).size,
        pendingAppointments: appointmentsList.filter(a => a.status === "Pending").length,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleUpdateStatus = async (appointmentId, status) => {
    try {
      const { data } = await axios.put(
        `http://localhost:4000/api/v1/appointment/update/${appointmentId}`,
        { status },
        { withCredentials: true }
      );
      
      setAppointments((prevAppointments) =>
        prevAppointments.map((appointment) =>
          appointment._id === appointmentId
            ? { ...appointment, status }
            : appointment
        )
      );
      
      toast.success(data.message);
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const getFilteredAndSortedAppointments = () => {
    let filtered = appointments;

    if (filterStatus !== "All") {
      filtered = filtered.filter(a => a.status === filterStatus);
    }

    if (searchTerm) {
      filtered = filtered.filter(a =>
        `${a.firstName} ${a.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(b.appointment_date) - new Date(a.appointment_date);
        case "name":
          return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
        case "department":
          return a.department.localeCompare(b.department);
        default:
          return 0;
      }
    });

    return sorted;
  };

  const { isAuthenticated, admin } = useContext(Context);
  
  if (!isAuthenticated) {
    return <Navigate to={"/login"} />;
  }

  const filteredAppointments = getFilteredAndSortedAppointments();

  return (
    <>
      <section className="dashboard page">
        <div className="banner stats-banner">
          <div className="stat-card welcome-card">
            <img src="/doc.png" alt="doctor" className="doc-img" />
            <div className="content">
              <p>Welcome back,</p>
              <h5>
                {admin && `${admin.firstName} ${admin.lastName}`}
              </h5>
              <p className="subtitle">
                Manage appointments, doctors, and patient care efficiently
              </p>
            </div>
          </div>

          <div className="stat-card">
            <FaCalendarCheck className="stat-icon appointments" />
            <div className="stat-content">
              <p>Total Appointments</p>
              <h3>{stats.totalAppointments}</h3>
            </div>
          </div>

          <div className="stat-card">
            <FaUserMd className="stat-icon doctors" />
            <div className="stat-content">
              <p>Registered Doctors</p>
              <h3>{stats.totalDoctors}</h3>
            </div>
          </div>

          <div className="stat-card">
            <FaUsers className="stat-icon pending" />
            <div className="stat-content">
              <p>Pending Appointments</p>
              <h3>{stats.pendingAppointments}</h3>
            </div>
          </div>
        </div>

        <div className="banner appointments-section">
          <div className="section-header">
            <h5>Manage Appointments</h5>
            <p className="subtitle">{filteredAppointments.length} appointment(s) found</p>
          </div>

          <div className="filters-container">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search by patient name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="controls">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="filter-select"
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
              >
                <option value="date">Sort by Date</option>
                <option value="name">Sort by Patient Name</option>
                <option value="department">Sort by Department</option>
              </select>

              <button onClick={fetchAppointments} className="refresh-btn">
                🔄 Refresh
              </button>
            </div>
          </div>

          {loading ? (
            <div className="loading-state">
              <p>Loading appointments...</p>
            </div>
          ) : filteredAppointments.length > 0 ? (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Patient Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Date & Time</th>
                    <th>Doctor</th>
                    <th>Department</th>
                    <th>Status</th>
                    <th>Visited</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map((appointment) => (
                    <tr key={appointment._id} className={`status-${appointment.status.toLowerCase()}`}>
                      <td className="patient-name">
                        {`${appointment.firstName} ${appointment.lastName}`}
                      </td>
                      <td>{appointment.email}</td>
                      <td>{appointment.phone}</td>
                      <td>{new Date(appointment.appointment_date).toLocaleString()}</td>
                      <td>
                        {`${appointment.doctor.firstName} ${appointment.doctor.lastName}`}
                      </td>
                      <td>{appointment.department}</td>
                      <td>
                        <select
                          className={`status-select status-${appointment.status.toLowerCase()}`}
                          value={appointment.status}
                          onChange={(e) =>
                            handleUpdateStatus(appointment._id, e.target.value)
                          }
                        >
                          <option value="Pending">Pending</option>
                          <option value="Accepted">Accepted</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </td>
                      <td className="visited-cell">
                        {appointment.hasVisited ? (
                          <GoCheckCircleFill className="icon-success" title="Visited" />
                        ) : (
                          <AiFillCloseCircle className="icon-danger" title="Not Visited" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <p>No appointments found</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Dashboard;
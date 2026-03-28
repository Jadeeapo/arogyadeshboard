import React, { useContext, useEffect, useState } from "react";
import { Context } from "../main";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { GoCheckCircleFill } from "react-icons/go";
import { AiFillCloseCircle } from "react-icons/ai";
import { FaCalendarAlt, FaUser, FaPhone, FaMapMarkerAlt } from "react-icons/fa";
import "./DoctorDashboard.css";

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    pendingAppointments: 0,
    acceptedAppointments: 0,
  });
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date");

  const { isAuthenticated, doctor } = useContext(Context);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAppointments();
    }
  }, [isAuthenticated]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        "http://localhost:4000/api/v1/appointment/getall",
        { withCredentials: true }
      );
      // Filter appointments for this doctor only
      const doctorAppointments = data.appointments.filter(
        (apt) => apt.doctorId === doctor?._id
      );
      setAppointments(doctorAppointments || []);

      // Calculate stats
      setStats({
        totalAppointments: doctorAppointments.length,
        pendingAppointments: doctorAppointments.filter(
          (a) => a.status === "Pending"
        ).length,
        acceptedAppointments: doctorAppointments.filter(
          (a) => a.status === "Accepted"
        ).length,
      });
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error("Failed to load appointments");
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (appointmentId, newStatus) => {
    try {
      await axios.put(
        `http://localhost:4000/api/v1/appointment/update/${appointmentId}`,
        { status: newStatus },
        { withCredentials: true }
      );
      toast.success(`Appointment ${newStatus.toLowerCase()}`);
      fetchAppointments();
    } catch (error) {
      toast.error("Failed to update appointment");
    }
  };

  const getFilteredAndSortedAppointments = () => {
    let filtered = [...appointments];

    // Filter by status
    if (filterStatus !== "All") {
      filtered = filtered.filter((apt) => apt.status === filterStatus);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (apt) =>
          apt.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          apt.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          apt.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    if (sortBy === "date") {
      filtered.sort(
        (a, b) => new Date(b.appointment_date) - new Date(a.appointment_date)
      );
    } else if (sortBy === "name") {
      filtered.sort((a, b) =>
        `${a.firstName} ${a.lastName}`.localeCompare(
          `${b.firstName} ${b.lastName}`
        )
      );
    }

    return filtered;
  };

  if (!isAuthenticated) {
    return <Navigate to={"/doctor/login"} />;
  }

  const filteredAppointments = getFilteredAndSortedAppointments();

  return (
    <section className="doctor-dashboard">
      {/* Welcome Section */}
      <div className="welcome-section">
        <h1>Welcome, Dr. {doctor?.firstName} {doctor?.lastName}</h1>
        <p className="department">{doctor?.doctorDepartment}</p>
      </div>

      {/* Statistics Cards */}
      <div className="stats-banner">
        <div className="stat-card">
          <div className="stat-icon">
            <FaCalendarAlt />
          </div>
          <div className="stat-content">
            <h3>{stats.totalAppointments}</h3>
            <p>Total Appointments</p>
          </div>
        </div>

        <div className="stat-card pending">
          <div className="stat-icon">
            <FaCalendarAlt />
          </div>
          <div className="stat-content">
            <h3>{stats.pendingAppointments}</h3>
            <p>Pending Requests</p>
          </div>
        </div>

        <div className="stat-card accepted">
          <div className="stat-icon">
            <GoCheckCircleFill />
          </div>
          <div className="stat-content">
            <h3>{stats.acceptedAppointments}</h3>
            <p>Accepted Appointments</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="controls">
        <input
          type="text"
          placeholder="Search by patient name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

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
        </select>

        <button onClick={fetchAppointments} className="refresh-btn">
          🔄 Refresh
        </button>
      </div>

      {/* Appointments List */}
      <div className="appointments-container">
        {loading && <div className="spinner">Loading...</div>}

        {!loading && filteredAppointments.length === 0 && (
          <div className="no-appointments">
            <p>No appointments found</p>
          </div>
        )}

        {!loading && filteredAppointments.length > 0 && (
          <div className="appointments-grid">
            {filteredAppointments.map((appointment) => (
              <div
                key={appointment._id}
                className={`appointment-card status-${appointment.status.toLowerCase()}`}
              >
                {/* Patient Info */}
                <div className="appointment-header">
                  <h3>
                    {appointment.firstName} {appointment.lastName}
                  </h3>
                  <span className={`status-badge ${appointment.status.toLowerCase()}`}>
                    {appointment.status}
                  </span>
                </div>

                {/* Patient Details */}
                <div className="appointment-details">
                  <div className="detail-row">
                    <FaUser className="icon" />
                    <span>{appointment.email}</span>
                  </div>
                  <div className="detail-row">
                    <FaPhone className="icon" />
                    <span>{appointment.phone}</span>
                  </div>
                  <div className="detail-row">
                    <FaMapMarkerAlt className="icon" />
                    <span>{appointment.address}</span>
                  </div>
                  <div className="detail-row">
                    <FaCalendarAlt className="icon" />
                    <span>{new Date(appointment.appointment_date).toLocaleString()}</span>
                  </div>
                </div>

                {/* Patient Problem/Notes */}
                <div className="patient-notes">
                  <h4>Patient Information:</h4>
                  <p>Gender: {appointment.gender}</p>
                  <p>DOB: {new Date(appointment.dob).toLocaleDateString()}</p>
                  <p>NIC: {appointment.nic}</p>
                  <p>Previous Visit: {appointment.hasVisited ? "Yes" : "No"}</p>
                </div>

                {/* Action Buttons */}
                <div className="appointment-actions">
                  {appointment.status === "Pending" && (
                    <>
                      <button
                        className="btn-accept"
                        onClick={() =>
                          handleUpdateStatus(appointment._id, "Accepted")
                        }
                      >
                        <GoCheckCircleFill /> Accept
                      </button>
                      <button
                        className="btn-reject"
                        onClick={() =>
                          handleUpdateStatus(appointment._id, "Rejected")
                        }
                      >
                        <AiFillCloseCircle /> Reject
                      </button>
                    </>
                  )}

                  {appointment.status === "Accepted" && (
                    <button
                      className="btn-view"
                      onClick={() => toast.info("Schedule consultation with patient")}
                    >
                      📞 Consult Patient
                    </button>
                  )}

                  {appointment.status === "Rejected" && (
                    <button
                      className="btn-reopen"
                      onClick={() =>
                        handleUpdateStatus(appointment._id, "Pending")
                      }
                    >
                      🔄 Reopen
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default DoctorDashboard;

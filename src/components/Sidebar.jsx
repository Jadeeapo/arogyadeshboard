import React, { useContext, useState } from "react";
import { TiHome } from "react-icons/ti";
import { RiLogoutBoxFill } from "react-icons/ri";
import { AiFillMessage } from "react-icons/ai";
import { GiHamburgerMenu } from "react-icons/gi";
import { FaUserDoctor } from "react-icons/fa6";
import { MdAddModerator } from "react-icons/md";
import { IoPersonAddSharp } from "react-icons/io5";
import axios from "axios";
import { toast } from "react-toastify";
import { Context } from "../main";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const [show, setShow] = useState(false);

  const { isAuthenticated, setIsAuthenticated, userRole } =
    useContext(Context);

  const handleLogout = async () => {
    try {
      const logoutEndpoint =
        userRole === "Admin"
          ? "http://localhost:4000/api/v1/user/admin/logout"
          : "http://localhost:4000/api/v1/user/doctor/logout";

      await axios
        .get(logoutEndpoint, {
          withCredentials: true,
        })
        .then((res) => {
          toast.success(res.data.message);
          setIsAuthenticated(false);
        });
    } catch (err) {
      console.error("Logout error:", err);
      toast.error("Error logging out");
    }
  };

  const navigateTo = useNavigate();

  const gotoHomePage = () => {
    navigateTo("/");
    setShow(!show);
  };

  const gotoDoctorDashboard = () => {
    navigateTo("/doctor/dashboard");
    setShow(!show);
  };

  const gotoDoctorsPage = () => {
    navigateTo("/doctors");
    setShow(!show);
  };

  const gotoMessagesPage = () => {
    navigateTo("/messages");
    setShow(!show);
  };

  const gotoAddNewDoctor = () => {
    navigateTo("/doctor/addnew");
    setShow(!show);
  };

  const gotoAddNewAdmin = () => {
    navigateTo("/admin/addnew");
    setShow(!show);
  };

  return (
    <>
      <nav
        style={!isAuthenticated ? { display: "none" } : { display: "flex" }}
        className={show ? "show sidebar" : "sidebar"}
      >
        <div className="links">
          {/* Admin Navigation */}
          {userRole === "Admin" && (
            <>
              <TiHome onClick={gotoHomePage} title="Admin Dashboard" />
              <FaUserDoctor onClick={gotoDoctorsPage} title="Manage Doctors" />
              <MdAddModerator onClick={gotoAddNewAdmin} title="Add Admin" />
              <IoPersonAddSharp
                onClick={gotoAddNewDoctor}
                title="Add Doctor"
              />
              <AiFillMessage onClick={gotoMessagesPage} title="Messages" />
            </>
          )}

          {/* Doctor Navigation */}
          {userRole === "Doctor" && (
            <>
              <TiHome onClick={gotoDoctorDashboard} title="My Appointments" />
              <AiFillMessage onClick={gotoMessagesPage} title="Messages" />
            </>
          )}

          {/* Logout (for both) */}
          <RiLogoutBoxFill onClick={handleLogout} title="Logout" />
        </div>
      </nav>
      <div
        className="wrapper"
        style={!isAuthenticated ? { display: "none" } : { display: "flex" }}
      >
        <GiHamburgerMenu className="hamburger" onClick={() => setShow(!show)} />
      </div>
    </>
  );
};

export default Sidebar;
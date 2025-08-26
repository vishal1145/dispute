import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import { NavLink } from "react-router-dom"; // ✅ Import NavLink
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

export default function Header() {
  const baseUrl = process.env.REACT_APP_Base_Url;
  const [isOpen, setIsOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState({});

  // Listen for responses from parent window
  React.useEffect(() => {
    const handleMessage = function (event) {
      if (event.data && event.data.action === "logout_success") {
        alert("Parent window confirmed logout: " + event.data.message);
      }
    };

    window.addEventListener("message", handleMessage);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  const fetchName = async () => {
    try {
      // setLoading(true);
      const userId = localStorage.getItem("user_id"); // ✅ fixed
      const { data } = await axios.get(`${baseUrl}/user/${userId}`);
      setAdminName(data || {});
    } catch (err) {
      console.error("Error fetching jobs:", err);
    }
  };

  useEffect(() => {
    fetchName();
  }, []);

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden bg-black text-white flex justify-between items-center px-4 py-3">
        <div className="flex items-start gap-2">
          <img
            src="/images/logo.webp"
            alt="Dispute Resolutions"
            className="w-10 h-10"
          />
          <div></div>
        </div>
        <button onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed md:sticky md:top-0 left-0 w-60 min-w-[240px] max-w-[240px] bg-black text-white flex flex-col min-h-screen md:h-screen py-6 transform transition-transform duration-300 z-50
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Logo */}
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img
  src="/images/logo.webp"
  alt="Dispute Resolutions"
  className="w-[200px] h-[200px] object-contain mb-3 mr-5"
/>
        </div>

        {/* Hello Message */}
        <div className="px-6 mb-6">
          <p className="text-white text-lg font-medium">
            {" "}
            Hello {adminName?.firstName} (Admin)
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-col text-left gap-5 text-sm w-full px-6">
          <NavLink
            to="/admin/admin-dashboard"
            className={({ isActive }) =>
              isActive
                ? "text-orange-400 font-bold"
                : "text-white hover:text-orange-400"
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/admin/job-list"
            className={({ isActive }) =>
              isActive
                ? "text-orange-400 font-bold"
                : "text-white hover:text-orange-400"
            }
          >
            Jobs
          </NavLink>
          <NavLink
            to="/admin/create-job"
            className={({ isActive }) =>
              isActive
                ? "text-orange-400 font-bold"
                : "text-white hover:text-orange-400"
            }
          >
            Create Job
          </NavLink>
          <NavLink
            to="/admin/member-list"
            className={({ isActive }) =>
              isActive
                ? "text-orange-400 font-bold"
                : "text-white hover:text-orange-400"
            }
          >
            Members
          </NavLink>
          <NavLink
            to="/admin/payments"
            className={({ isActive }) =>
              isActive
                ? "text-orange-400 font-bold"
                : "text-white hover:text-orange-400"
            }
          >
            Payments
          </NavLink>
        </div>

        {/* Log Out */}
        <div className="mt-auto text-left px-6">
          <button
            onClick={() => {
              const SITE_URL = "https://restapi.algofolks.com/dashboard";
              if (SITE_URL) {
                try {
                  window.parent.location.href = `${SITE_URL}?logout=true`;
                } catch (error) {
                  console.log("Error redirecting: " + error.message);
                }
              }
            }}
            className="text-white hover:text-orange-400 text-lg font-medium transition-colors"
          >
            Log Out
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
        />
      )}
    </>
  );
}

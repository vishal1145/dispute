import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { NavLink } from "react-router-dom"; // ✅ Import NavLink
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Navbar() {
  const baseUrl = process.env.REACT_APP_Base_Url;
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState("John");
  const [userLoading, setUserLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch user data from dashboard API
  const fetchUserData = async () => {
    try {
      setUserLoading(true);
      
      // Get userId from localStorage or fallback
      const currentUserId = localStorage.getItem("user_id") ;
      
      
      const { data } = await axios.get(`${baseUrl}/user/dashboard/${currentUserId}`);
      
      console.log('User Data API Response:', data);
      
      // Extract user name from the API response
     const candidateFirst =
        data?.userInfo?.firstName ??
        data?.dashboard?.userInfo?.firstName ??
        data?.user?.firstName ??
        "";

      // Ensure only the first token (handles "John Doe" accidentally in firstName)
      const onlyFirst = String(candidateFirst).trim().split(/\s+/)[0] || "John";
      setUserName(onlyFirst);
    } catch (error) {
      console.error("User Data API Error:", error);
    } finally {
      setUserLoading(false);
    }
  };
  // Listen for responses from parent window
  React.useEffect(() => {
    const handleMessage = function(event) {
      if (event.data && event.data.action === 'logout_success') {
        alert('Parent window confirmed logout: ' + event.data.message);
      }
    };

    window.addEventListener('message', handleMessage);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  // Get userId from localStorage
  const [userId, setUserId] = useState(() => localStorage.getItem("user_id") );

  // Fetch user data on component mount and when userId changes
  useEffect(() => {
    fetchUserData();
  }, [userId]);

  // Listen for userId changes in localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const newUserId = localStorage.getItem("user_id");
      if (newUserId && newUserId !== userId) {
        setUserId(newUserId);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [userId]);

  // const logout = async () => {
  //   window.location.href = "https://disputesresolutions.com";
  // };

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
          <div>
          
          </div>
        </div>
        <button onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed md:static top-0 left-0 w-60 min-w-[240px] max-w-[240px] bg-black text-white flex flex-col h-[100vh] py-6 transform transition-transform duration-300 z-50
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

        {/* User Name Message */}
        <div className="px-6 mb-6">
          {userLoading ? (
            <p className="text-white text-lg font-medium">Loading...</p>
          ) : (
            <p className="text-white text-lg font-medium">Hello {userName}</p>
          )}
        </div>

        {/* Links */}
        <div className="flex flex-col text-left gap-5 text-sm w-full px-6">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive
                  ? "text-orange-400 font-bold"
                : "text-white hover:text-orange-400"
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/job-scheduler"
            className={({ isActive }) =>
              isActive
                ? "text-orange-400 font-bold"
                : "text-white hover:text-orange-400"
            }
          >
            Job Schedule
          </NavLink>

          <NavLink
            to="/my-current-jobs"
            className={({ isActive }) =>
              isActive
                ? "text-orange-400 font-bold"
                : "text-white hover:text-orange-400"
            }
          >
            My Current Jobs
          </NavLink>

          <NavLink
            to="/my-completed-jobs"
            className={({ isActive }) =>
              isActive
                ? "text-orange-400 font-bold"
                : "text-white hover:text-orange-400"
            }
          >
            My Completed Jobs
          </NavLink>
<NavLink
            to="/my-payments"
            className={({ isActive }) =>
              isActive
                ? "text-orange-400 font-bold"
                : "text-white hover:text-orange-400"
            }
          >
            My Payments
          </NavLink>

          <NavLink
            to="/my-account"
            className={({ isActive }) =>
              isActive
                ? "text-orange-400 font-bold"
                : "text-white hover:text-orange-400"
            }
          >
            My Account
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
                  console.log('Error redirecting: ' + error.message);
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

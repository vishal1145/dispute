import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import { NavLink } from "react-router-dom"; // ✅ Import NavLink
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const logout = async () => {
    window.location.href = "https://disputesresolutions.com";
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden bg-black text-white flex justify-between items-center px-4 py-3">
        <div className="flex items-start gap-2">
          <img
            src="/icons/person-1.svg"
            alt="Dispute Resolutions"
            className="w-10 h-10"
          />
          <div>
            <h1 className="text-lg font-bold text-blue-500">DISPUTE</h1>
            <span className="text-xs text-gray-400">RESOLUTIONS</span>
          </div>
        </div>
        <button onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed md:static top-0 left-0  w-60 bg-black text-white flex flex-col h-[100vh] py-6 transform transition-transform duration-300 z-50
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Logo */}
        {/* <div className="flex flex-col items-center mb-10">
          <img
            src="/icons/person-1.svg"
            alt="Dispute Resolutions"
            className="w-20 h-20 object-contain"
          />
          <h1 className="text-lg font-bold tracking-wide text-blue-500">
            DISPUTE
          </h1>
          <span className="text-xs tracking-widest text-gray-400">
            RESOLUTIONS
          </span>
        </div> */}

        {/* Links */}
        <div className="flex flex-col text-left gap-5 text-sm w-full px-6">
          {/* <span className="text-white">Hello Member</span> */}

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
          <NavLink
            onClick={logout}
            className={({ isActive }) =>
              isActive
                ? "text-orange-400 font-bold"
                : "text-white hover:text-orange-400"
            }
          >
            Log Out
          </NavLink>
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

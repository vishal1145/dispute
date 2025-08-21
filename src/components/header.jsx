import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import { NavLink } from "react-router-dom";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  // const logout = async () => {
  //   window.location.href = "https://disputesresolutions.com";
  // };

  const logoutViaRedirect = () => {
    const siteUrl = process.env.SITE_URL;
    if (siteUrl) {
      try {
        window.parent.location.href = `${siteUrl}?logout=true`;
      } catch (error) {
        alert("Error redirecting: " + error.message);
      }
    }
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden bg-black text-white flex justify-between items-center px-4 py-3">
        <div className="flex items-start gap-2">
          {/* <img
            src="/icons/person-1.svg"
            alt="Dispute Resolutions"
            className="w-10 h-10"
          /> */}
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
        className={`fixed md:static top-0 left-0 w-60 bg-black text-white flex flex-col py-6 transform transition-transform duration-300 z-50 h-screen overflow-y-auto
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Logo */}
        <div className="flex flex-col items-left px-6 mb-10">
          <img
            src="/icons/person-1.svg"
            alt="Dispute Resolutions"
            className="w-20 h-20 object-contain"
          />
          {/* <h1 className="text-lg font-bold tracking-wide text-blue-500">
            DISPUTE RESOLUTIONS
          </h1>
          <span className="text-xs tracking-widest text-gray-400">
            RESOLUTIONS
          </span> */}
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
             DashBoard
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
        </div>

        {/* Log Out */}
        <div className="mt-auto text-left px-6">
          <NavLink
            onClick={logoutViaRedirect}
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

import React, { useState, useEffect, useRef, useCallback } from "react";
import accountData from "../Data/accountData.json";
import Navbar from "../components/navbar";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import { useSearchParams } from "react-router-dom";

/* ---------- Reusable MultiSelect with checkboxes ---------- */
function MultiSelect({ name, value = [], options = [], placeholder = "Select...", onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = () => setOpen((v) => !v);

  const toggleOption = (opt) => {
    const exists = value.includes(opt);
    const next = exists ? value.filter((v) => v !== opt) : [...value, opt];
    onChange({ target: { name, value: next } });
  };

  const clearAll = () => onChange({ target: { name, value: [] } });

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={toggle}
        className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <span className="truncate">
          {value?.length ? value.join(", ") : placeholder}
        </span>
        <svg width="16" height="16" viewBox="0 0 20 20" className="ml-2 opacity-60">
          <path d="M5 7l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-10 mt-2 w-full max-h-60 overflow-auto rounded-md border border-gray-200 bg-white shadow">
          <div className="p-2 sticky top-0 bg-white border-b">
            <button type="button" onClick={clearAll} className="text-xs text-blue-600 hover:underline">
              Clear all
            </button>
          </div>
          <ul className="py-1">
            {options.map((opt, i) => (
              <li
                key={i}
                className="px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-2"
                onClick={() => toggleOption(opt)}
              >
                <input type="checkbox" readOnly checked={value.includes(opt)} className="h-4 w-4" />
                <span className="text-sm text-gray-800">{opt || "—"}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* -------------------------- Page -------------------------- */
export default function MyAccount() {
  // Use the exact API endpoint you want
  const baseUrl = "https://restapi.algofolks.com/wp-json/wp-rest-api/v1";
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const userId = "6"; // Hardcoded to use user ID 6

  console.log("Base URL:", baseUrl);
  console.log("Full API URL:", `${baseUrl}/user/${userId}`);

  console.log("Using userId:", userId);
  console.log("Full fetch URL:", `${baseUrl}/user/${userId}`);

  // Get userId from URL parameters (but don't use it for API calls)
  const [searchParams] = useSearchParams();
  const qpUserId = searchParams.get("userId");

  // Initialize form data from accountData
  useEffect(() => {
    const initialData = {};
    accountData.forEach((field) => {
      // Make expertise (or any multiple field) an array
      if (field.name === "expertise" || field.multiple) {
        initialData[field.name] = [];
      } else {
        initialData[field.name] = "";
      }
    });
    setFormData(initialData);
  }, []);

  // Note: We're not using localStorage userId anymore - always using "6"

  // Ensure form is always visible even if API fails
  useEffect(() => {
    if (!loading && !userData) {
      setUserData({}); // Set empty user data to ensure form renders
    }
  }, [loading, userData]);

  const fetchUserProfile = useCallback(async () => {
    try {
      setLoading(true);
      const apiUrl = `${baseUrl}/user/${userId}`;
      console.log("Fetching from:", apiUrl);
      const { data } = await axios.get(apiUrl);
      console.log("API Response:", data);
      const user = data?.user || data;

      const expertiseArray = Array.isArray(user.expertise)
        ? user.expertise
        : (user.expertise ? String(user.expertise).split(",").map((s) => s.trim()).filter(Boolean) : []);

      // Map API field names to form field names
      const userFormData = {
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.emailAddress || "",
        password: "",
        company: user.companyName || "",
        address: user.address || "",
        phone: user.phoneMobile || "",
        expertise: expertiseArray, // <-- array for multiselect
        bankName: user.bankName || "",
        bankBranch: user.bankBranch || "",
        bankAccountNumber: user.bankAccountNumber || "",
        bankAccountName: user.bankAccountName || "",
        additional: user.addionalInfornation || "",
      };

      setFormData((prev) => ({ ...prev, ...userFormData }));
      setUserData(user);
    } catch (err) {
      console.error("Error fetching user profile:", err);
      toast.error("Failed to fetch user profile. You can still update your details.");
      console.error("Response data:", err.response?.data);
      console.error("Response status:", err.response?.status);
      setUserData({});
    } finally {
      setLoading(false);
    }
  }, [baseUrl]);

  // Fetch user profile on component mount
  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target; // value can be string OR array (from MultiSelect)
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      // Validate password if provided
      if (formData.password && formData.password.trim() !== "") {
        const password = formData.password.trim();

        if (password.length > 255) {
          toast.error("Password is too long. Please use a shorter password.");
          setLoading(false);
          return;
        }

        if (!/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/.test(password)) {
          toast.error("Password contains invalid characters. Please use only letters, numbers, and common symbols.");
          setLoading(false);
          return;
        }
      }

      const updateData = {
        userId: userData?.id || Number(userId) || 1,
      };

      const fieldMapping = {
        firstName: "firstName",
        lastName: "lastName",
        email: "emailAddress",
        company: "companyName",
        address: "address",
        phone: "phoneMobile",
        expertise: "expertise",
        bankName: "bankName",
        bankBranch: "bankBranch",
        bankAccountNumber: "bankAccountNumber",
        bankAccountName: "bankAccountName",
        additional: "addionalInfornation", // backend typo
      };

      if (formData.password && formData.password.trim() !== "") {
        updateData.password = formData.password.trim();
      }

      Object.keys(formData).forEach((key) => {
        if (key === "password") return;

        let val = formData[key];

        // Skip truly empty values (allow 0 / false)
        if (Array.isArray(val)) {
          if (val.length === 0) return;
          val = val.join(","); // send CSV to backend
        } else if (val == null || String(val).trim() === "") {
          return;
        }

        const dbFieldName = fieldMapping[key] || key;
        updateData[dbFieldName] = typeof val === "string" ? val.trim() : val;
      });

      const updateUrl = `${baseUrl}/user/profile/update`;
      console.log("Sending update request to:", updateUrl);
      console.log("Update data:", updateData);

      const response = await axios.put(updateUrl, updateData);

      if (response.status === 200) {
        toast.success("Profile updated successfully!");
        await fetchUserProfile();
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      console.error("Response data:", err.response?.data);
      console.error("Response status:", err.response?.status);
      toast.error(`Failed to update profile: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Remove the blocking loading state - form will always show
  if (loading && !userData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex flex-col md:flex-row">
          <Navbar />
          <div className="flex-1 p-4 sm:p-6 md:p-8 bg-white flex items-center justify-center">
            <Box sx={{ display: "flex" }}>
              <CircularProgress />
            </Box>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col md:flex-row">
        <Navbar />

        <div className="flex-1 p-4 sm:p-6 md:p-8 bg-white overflow-y-auto max-h-screen relative">
          <ToastContainer />

          {/* Full Page Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 bg-white flex items-center justify-center z-50">
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <CircularProgress size={60} />
              </Box>
            </div>
          )}

          <p className="text-xl sm:text-2xl font-bold mb-4 text-gray-600">
            If required, please update your details and click the Update button.
          </p>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {accountData.map((field, index) => (
              <div key={index} className={`${field.fullWidth ? "sm:col-span-2" : ""}`}>
                {/* Don't show regular label for bank fields - they have special heading */}
                {field.type !== "bank" && (
                  <label className="block text-xs uppercase tracking-wide font-medium mb-2 text-gray-600">
                    {field.label}
                  </label>
                )}

                {field.type === "textarea" ? (
                  <textarea
                    name={field.name}
                    value={formData[field.name] || ""}
                    onChange={handleInputChange}
                    placeholder={field.placeholder || ""}
                    rows={field.rows || "1"}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
                  />
                ) : field.type === "select" ? (
                  // 👇 Multi-select for "expertise" (or any field with field.multiple = true)
                  field.name === "expertise" || field.multiple ? (
                    <MultiSelect
                      name={field.name}
                      value={Array.isArray(formData[field.name]) ? formData[field.name] : []}
                      options={(field.options || []).filter((o) => o !== "")}
                      placeholder={field.placeholder || "Select Expertise"}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <select
                      name={field.name}
                      value={formData[field.name] || ""}
                      onChange={handleInputChange}
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {(field.options || []).map((option, optionIndex) => (
                        <option key={optionIndex} value={option}>
                          {option === "" ? "Select..." : option}
                        </option>
                      ))}
                    </select>
                  )
                ) : field.type === "bank" ? (
                  <div className="space-y-3">
                    {/* Bank details heading with special styling */}
                    <div className="mb-4">
                      <label className="block text-xl font-bold text-gray-800">
                        {field.label}
                      </label>
                    </div>
                    {(field.subFields || []).map((subField, subIndex) => (
                      <div key={subIndex}>
                        <label className="block text-xs uppercase tracking-wide font-medium mb-2 text-gray-600">
                          {subField.label}
                        </label>
                        <input
                          type={subField.type}
                          name={subField.name}
                          value={formData[subField.name] || ""}
                          onChange={handleInputChange}
                          placeholder={subField.placeholder || ""}
                          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <input
                    type={field.type}
                    name={field.name}
                    value={formData[field.name] || ""}
                    onChange={handleInputChange}
                    placeholder={field.placeholder || ""}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                )}
              </div>
            ))}

            {/* Button Row */}
            <div className="col-span-1 sm:col-span-2 flex justify-center sm:justify-start mt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white text-sm font-medium px-6 py-3 rounded-lg transition-colors"
              >
                Update
              </button>
            </div>
          </form>

       
        </div>
      </div>
    </div>
  );
}

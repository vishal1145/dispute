import React, { useState, useEffect } from "react";
import accountData from "../Data/accountData.json";
import Navbar from "../components/navbar";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

export default function MyAccount() {
  const baseUrl = process.env.REACT_APP_Base_Url;
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);

  // Debug: Log the baseUrl to see what it contains
  console.log("Base URL:", baseUrl);
  console.log("Full fetch URL:", `${baseUrl}/users`);
  console.log("Full update URL:", `${baseUrl}/user/profile/update`);

  // Initialize form data from accountData
  useEffect(() => {
    const initialData = {};
    accountData.forEach(field => {
      initialData[field.name] = '';
    });
    setFormData(initialData);
    
    // Fetch user profile data
    fetchUserProfile();
  }, []);

  // Ensure form is always visible even if API fails
  useEffect(() => {
    if (!loading && !userData) {
      setUserData({}); // Set empty user data to ensure form renders
    }
  }, [loading, userData]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      // Using the correct endpoint - baseUrl already contains the full path
      const { data } = await axios.get(`${baseUrl}/users`);
      if (data.users && data.users.length > 0) {
        // For now, taking the first user - you might want to filter by current user ID
        const user = data.users[0];
        
        // Map API field names to form field names
        const userFormData = {
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.emailAddress || '',
          password: '',
          company: user.companyName || '',
          address: user.address || '',
          phone: user.phoneMobile || '',
          expertise: user.expertise || '',
          bankName: user.bankName || '',
          bankBranch: user.bankBranch || '',
          bankAccountNumber: user.bankAccountNumber || '',
          bankAccountName: user.bankAccountName || '',
          additional: user.addionalInfornation || ''
        };
        
        setFormData(userFormData);
        setUserData(user);
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
      toast.error("Failed to fetch user profile. You can still update your details.");
      // Don't let the error prevent the form from showing
      setUserData({}); // Set empty user data so form can still render
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Validate password if provided
      if (formData.password && formData.password.trim() !== '') {
        const password = formData.password.trim();
        
        // Check password length (typical WordPress password field is 255 characters)
        if (password.length > 255) {
          toast.error("Password is too long. Please use a shorter password.");
          setLoading(false);
          return;
        }
        
        // Check for invalid characters
        if (!/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/.test(password)) {
          toast.error("Password contains invalid characters. Please use only letters, numbers, and common symbols.");
          setLoading(false);
          return;
        }
      }
      
      // Using the "update profile details" endpoint from Postman collection
      // Only send the fields that the API actually expects
      const updateData = {
        userId: userData?.id || 1
      };
      
      // Only add password if it's provided and not empty
      if (formData.password && formData.password.trim() !== '') {
        updateData.password = formData.password.trim();
      }
      
      // Only add other fields if they have values and are not empty
      // Map the form field names to the actual database field names
      const fieldMapping = {
        firstName: 'firstName',
        lastName: 'lastName', 
        email: 'emailAddress',
        company: 'companyName',
        address: 'address',
        phone: 'phoneMobile',
        expertise: 'expertise',
        bankName: 'bankName',
        bankBranch: 'bankBranch',
        bankAccountNumber: 'bankAccountNumber',
        bankAccountName: 'bankAccountName',
        additional: 'addionalInfornation' // Note: this matches the typo in your Postman collection
      };
      
      Object.keys(formData).forEach(key => {
        if (key !== 'password' && formData[key] && formData[key].trim() !== '') {
          const dbFieldName = fieldMapping[key] || key;
          updateData[dbFieldName] = formData[key].trim();
        }
      });
      
      console.log("Sending update request to:", `${baseUrl}/user/profile/update`);
      console.log("Update data:", updateData);
      
      const response = await axios.put(
        `${baseUrl}/user/profile/update`,
        updateData
      );
      
      if (response.status === 200) {
        toast.success("Profile updated successfully!");
        // Refresh user data
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
          {/* Sidebar */}
          <Navbar />

          {/* Main Content */}
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
        {/* Sidebar */}
        <Navbar />

        {/* Main Content */}
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
              <div
                key={index}
                className={`${field.fullWidth ? "sm:col-span-2" : ""}`}
              >
                <label className="block text-xs uppercase tracking-wide font-medium mb-2 text-gray-600">
                  {field.label}
                </label>

                {field.type === "textarea" ? (
                  <textarea
                    name={field.name}
                    value={formData[field.name] || ""}
                    onChange={handleInputChange}
                    placeholder={field.placeholder || ""}
                    rows={field.rows || "1"}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
                  ></textarea>
                ) : field.type === "select" ? (
                  <select
                    name={field.name}
                    value={formData[field.name] || ""}
                    onChange={handleInputChange}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {field.options.map((option, optionIndex) => (
                      <option key={optionIndex} value={option}>
                        {option === "" ? "Select Expertise" : option}
                      </option>
                    ))}
                  </select>
                ) : field.type === "bank" ? (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 mb-2"></p>
                    {field.subFields.map((subField, subIndex) => (
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

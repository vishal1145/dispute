import React, { useState, useEffect, useRef, useCallback } from "react";
import accountData from "../Data/accountData.json";
import Navbar from "../components/navbar";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

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
            {(options || []).map((opt, i) => (
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
  const baseUrl = "https://restapi.algofolks.com/wp-json/wp-rest-api/v1";

  // ✅ Only read userId from localStorage (never set it)
  const resolveInitialUserId = () => {
    const fromLS = localStorage.getItem("user_id");
    // Guard against string "null"/"undefined"
    if (!fromLS || fromLS === "null" || fromLS === "undefined") return "6";
    return fromLS;
  };

  const [userId, setUserId] = useState(resolveInitialUserId);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);

  // Optional: if user_id changes in another tab, reflect it here (still read-only)
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "user_id") {
        const nv = e.newValue;
        if (nv && nv !== userId) setUserId(nv);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [userId]);

  // Initialize form schema once
  useEffect(() => {
    const initialData = {};
    (accountData || []).forEach((field) => {
      initialData[field.name] = field.name === "expertise" || field.multiple ? [] : "";
    });
    
    // Initialize bank fields separately since they're not in JSON
    initialData.bankName = "";
    initialData.bankBranch = "";
    initialData.bankAccountNumber = "";
    initialData.bankAccountName = "";
    initialData.state = "";
    
    setFormData(initialData);
  }, []);

  // Ensure form renders even if API fails
  useEffect(() => {
    if (!loading && !userData) setUserData({});
  }, [loading, userData]);

  const fetchUserProfile = useCallback(async () => {
    try {
      setLoading(true);
      const apiUrl = `${baseUrl}/user/${userId}`;
      const { data } = await axios.get(apiUrl);
      const user = data?.user || data || {};

      const expertiseArray = Array.isArray(user.expertise)
        ? user.expertise
        : (user.expertise
            ? String(user.expertise).split(",").map((s) => s.trim()).filter(Boolean)
            : []);

      const userFormData = {
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.emailAddress || "",
        password: "",
        company: user.companyName || "",
        address: user.address || "",
        phone: user.phoneMobile || "",
        expertise: expertiseArray,
        bankName: user.bank || "",
        bankBranch: user.branch_bsb || "",
        bankAccountNumber: user.account_number || "",
        bankAccountName: user.account_name || "",
        additional: user.addionalInfornation || "",
        state: user.state || "",
      };

      setFormData((prev) => ({ ...prev, ...userFormData }));
      setUserData(user);
    } catch (err) {
      console.error("Error fetching user profile:", err);
      toast.error("Failed to fetch user profile. You can still update your details.");
      setUserData({});
    } finally {
      setLoading(false);
    }
  }, [baseUrl, userId]);

  // Fetch profile on mount and whenever userId changes
  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target; // value can be string OR array (from MultiSelect)
    console.log('Input change:', name, value); // Debug log
    setFormData((prev) => ({ ...prev, [name]: value }));
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
        // Prefer backend user id if present, else fallback to the LS value
        userId: userData?.id || Number(userId) ,
      };

      const fieldMapping = {
        firstName: "firstName",
        lastName: "lastName",
        email: "emailAddress",
        company: "companyName",
        address: "address",
        phone: "phoneMobile",
        expertise: "expertise",
        bankName: "bank",
        branch_bsb: "bankBranch",
        account_number: "bankAccountNumber",
        account_name: "bankAccountName",
        additional: "addionalInfornation", // backend typo kept as-is
        state: "state",
      };
      
      // Debug: Log the exact field mapping being used
      console.log('Field mapping object:', fieldMapping);

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
        
        // Debug: Log each field being processed
        console.log(`Processing field: ${key} -> ${dbFieldName} = ${val}`);
      });
      
      // Always include bank fields in update, even if empty
      // updateData.bankName = formData.bank || "";
      updateData.branchBsb = formData.bankBranch || "";
      updateData.accountNumber = formData.bankAccountNumber || "";
      updateData.accountName = formData.bankAccountName|| "";
      
      console.log('Bank fields being sent:', {
        bankName: updateData.bankName,
        bankBranch: updateData.bankBranch,
        bankAccountNumber: updateData.bankAccountNumber,
        bankAccountName: updateData.bankAccountName
      });

      const updateUrl = `${baseUrl}/user/profile/update`;
      
      // Debug: Log what we're sending to the API
      console.log('Sending update data to API:', updateData);
      console.log('Bank fields in formData:', {
        bankName: formData.bankName,
        bankBranch: formData.bankBranch,
        bankAccountNumber: formData.bankAccountNumber,
        bankAccountName: formData.bankAccountName
      });
      
     
      
      const response = await axios.put(updateUrl, updateData);

      if (response.status === 200) {
        toast.success("Profile updated successfully!");
        console.log('API Response:', response.data);
        console.log('API Response Status:', response.status);
        console.log('API Response Headers:', response.headers);
        await fetchUserProfile();
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error(`Failed to update profile: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Loading shell (non-blocking form below still shows an overlay)
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
            {(accountData || []).map((field, index) => (
              <div key={index} className={field.fullWidth ? "sm:col-span-2" : ""}>
                {/* Show label for all fields except bankName which has custom heading */}
                {field.name !== "bankName" && (
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
                  // Multi-select for "expertise" (or any field with field.multiple = true)
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

            {/* Additional Information Section - Left Side */}
            <div className="sm:col-span-1">
            
              
              

              {/* State Field - Added below Additional Information */}
              <div className="mt-4">
                <label className="block text-xs uppercase tracking-wide font-medium mb-2 text-gray-600">
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state || ""}
                  onChange={handleInputChange}
                  placeholder="Enter your state"
                  className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Bank Details Section - Below State */}
              <div className="mt-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Bank Details</h3>
                
                <div className="space-y-4">
                  {/* Bank Name */}
                  <div>
                    <label className="block text-xs uppercase tracking-wide font-medium mb-2 text-gray-600">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      name="bankName"
                      value={formData.bankName || ""}
                      onChange={handleInputChange}
                      placeholder="Enter Bank Name"
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Branch/BSB */}
                  <div>
                    <label className="block text-xs uppercase tracking-wide font-medium mb-2 text-gray-600">
                      Branch/BSB
                    </label>
                    <input
                      type="text"
                      name="bankBranch"
                      value={formData.bankBranch || ""}
                      onChange={handleInputChange}
                      placeholder="Enter Branch or BSB Code"
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Account Number */}
                  <div>
                    <label className="block text-xs uppercase tracking-wide font-medium mb-2 text-gray-600">
                      Account Number
                    </label>
                    <input
                      type="text"
                      name="bankAccountNumber"
                      value={formData.bankAccountNumber || ""}
                      onChange={handleInputChange}
                      placeholder="Enter Account Number"
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Account Name */}
                  <div>
                    <label className="block text-xs uppercase tracking-wide font-medium mb-2 text-gray-600">
                      Account Name
                    </label>
                    <input
                      type="text"
                      name="bankAccountName"
                      value={formData.bankAccountName || ""}
                      onChange={handleInputChange}
                      placeholder="Enter Account Holder Name"
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
        

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

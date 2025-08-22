import React, { useState, useEffect } from "react";
import Header from "../../components/header";
import axios from "axios";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import { useSearchParams } from "react-router-dom";

export default function Account() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);

  const [searchParams] = useSearchParams();
  const userId = searchParams.get("member_id");
  const baseUrl = process.env.REACT_APP_Base_Url;

  const normalizeUserData = (data) => ({
    firstName: data.firstName || "",
    lastName: data.lastName || "",
    emailAddress: data.emailAddress || "",
    companyName: data.companyName || "",
    address: data.address || "",
    phoneMobile: data.phoneMobile || "",
    expertise: data.expertise || "",
    addionalInfornation: data.addionalInfornation || "",
    bank: data.bank || "",
    branch_bsb: data.branch_bsb || "",
    account_number: data.account_number || "",
    account_name: data.account_name || "",
  });

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;
      try {
        setLoading(true);
        const { data } = await axios.get(`${baseUrl}/user/${userId}`, {
          withCredentials: true,
        });
        setUserData(normalizeUserData(data));
      } catch (err) {
        console.error("Error fetching user:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId, baseUrl]);
  

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col md:flex-row">
        {/* Sidebar */}
        <Header />

        {/* Main Content */}
        <div className="flex-1 p-4 sm:p-6 md:p-8 bg-white overflow-y-auto max-h-screen relative">
          <p className="text-xl sm:text-2xl font-bold mb-6 text-gray-700">
            User Account Details
          </p>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <CircularProgress />
              </Box>
            </div>
          ) : (
            <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-600">
                  First Name
                </label>
                <input
                  type="text"
                  value={userData?.firstName || ""}
                  readOnly
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm"
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-600">
                  Last Name
                </label>
                <input
                  type="text"
                  value={userData?.lastName || ""}
                  readOnly
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-600">
                  Email Address
                </label>
                <input
                  type="email"
                  value={userData?.emailAddress || ""}
                  readOnly
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-600">
                  Password
                </label>
                <input
                  type="password"
                  value="********"
                  readOnly
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm"
                />
              </div>

              {/* Company Name */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-600">
                  Company Name
                </label>
                <input
                  type="text"
                  value={userData?.companyName || ""}
                  readOnly
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm"
                  placeholder="If applicable"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-600">
                  Address
                </label>
                <textarea
                  value={userData?.address || ""}
                  readOnly
                  rows={2}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm resize-y"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-600">
                  Phone (Mobile)
                </label>
                <input
                  type="text"
                  value={userData?.phoneMobile || ""}
                  readOnly
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm"
                />
              </div>

              {/* Expertise */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-600">
                  Expertise
                </label>
                <select
                  value={userData?.expertise || ""}
                  // disabled
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm"
                >
                  <option value="">Select Expertise</option>
                  <option value="Mediation">Mediation</option>
                  <option value="Arbitration">Arbitration</option>
                  <option value="Both">Both</option>
                </select>
              </div>

              {/* Additional Info */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2 text-gray-600">
                  Additional Information
                </label>
                <textarea
                  value={userData?.addionalInfornation || ""}
                  readOnly
                  rows={3}
                  placeholder="degrees, professions, areas of expertise, lawyer etc"
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm resize-y"
                />
              </div>

              {/* Bank Details */}
              <div className="md:col-span-2">
                <p className="text-sm font-semibold mb-4 text-gray-700">
                  Bank Details
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-2 text-gray-600">
                      Bank
                    </label>
                    <input
                      type="text"
                      value={userData?.bank || ""}
                      readOnly
                      placeholder="Enter bank name"
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-2 text-gray-600">
                      Branch/BSB
                    </label>
                    <input
                      type="text"
                      value={userData?.branch_bsb || ""}
                      readOnly
                      placeholder="Enter branch or BSB code"
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-2 text-gray-600">
                      Account Number
                    </label>
                    <input
                      type="text"
                      value={userData?.account_number || ""}
                      readOnly
                      placeholder="Enter account number"
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-2 text-gray-600">
                      Account Name
                    </label>
                    <input
                      type="text"
                      value={userData?.account_name || ""}
                      readOnly
                      placeholder="Enter account holder name"
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm"
                    />
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
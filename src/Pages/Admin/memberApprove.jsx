import React, { useState, useEffect } from "react";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import Header from "../../components/header";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from "@mui/material";

const PRODUCTS_PER_PAGE = 10;

const toTitle = (s) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";

export default function MemberApprove() {
  const baseUrl = process.env.REACT_APP_Base_Url;
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [uploading, setUploading] = useState(false); // button text only
  const [open, setOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const navigate = useNavigate();

  const getJobs = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${baseUrl}/users`);
      setUsers(data.users || []);
      
      // Debug: Log expertise fields to see what data we have
      if (data.users && data.users.length > 0) {
        const expertiseFields = [...new Set(data.users.map(user => user.expertise).filter(Boolean))];
        console.log("Available expertise fields:", expertiseFields);
        console.log("Total users loaded:", data.users.length);
        
        // Log first few users to see their expertise values
        console.log("Sample users expertise:", data.users.slice(0, 5).map(u => ({
          id: u.id,
          name: `${u.firstName} ${u.lastName}`,
          expertise: u.expertise,
          status: u.status
        })));
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getJobs();
  }, []);

  // const filteredJobs = users.filter((u) => {
  //   if (statusFilter === "all") return true;
  //   return (u.status || "").toLowerCase() === statusFilter.toLowerCase();
  // });

  const handleMemberStatus = async (status, userId) => {
    try {
      const body = {
        userId,
        action: status,
        adminNotes: `All documents verified and ${status}`,
      };
      setLoading(true);
      await axios.put(`${baseUrl}/admin/approve-user`, body, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      toast.success(`Member ${status} successfully!`);
      getJobs();
    } catch (error) {
      toast.error(`Please try again later`);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenConfirm = (action, userId) => {
    setSelectedAction(action);
    setSelectedUserId(userId);
    setOpen(true);
  };
  const handleConfirm = () => {
    if (selectedAction && selectedUserId) {
      handleMemberStatus(selectedAction, selectedUserId);
    }
    setOpen(false);
  };
  const handleCancel = () => {
    setOpen(false);
    setSelectedAction(null);
    setSelectedUserId(null);
  };
  // Filter based on search criteria
  const searchedJobs = users.filter((job) => {
    const search = searchTerm.toLowerCase();

    // status filter
    if (
      statusFilter !== "all" &&
      (job.status || "").toLowerCase() !== statusFilter.toLowerCase()
    ) {
      return false;
    }

    // alphabetical search filter
    const matchesSearch = !searchTerm || 
      `${job.firstName || ""} ${job.lastName || ""}`.toLowerCase().includes(search) ||
      job.title?.toLowerCase().includes(search) ||
      job.address?.toLowerCase().includes(search) ||
      job.resolution?.toLowerCase().includes(search) ||
      job.numberOfJobs?.toString().includes(search) ||
      job.expertise?.toLowerCase().includes(search) || 
      job.jobStatistics?.completedJobs?.toString().includes(search);

    // field filter
    const matchesField = !searchField || searchField === "" || 
      (job.expertise && job.expertise.toLowerCase().includes(searchField.toLowerCase()));

    // location filter
    const matchesLocation = !searchLocation || 
      (job.address || "").toLowerCase().includes(searchLocation.toLowerCase());

    // Debug logging for field filter
    if (searchField && searchField !== "") {
      console.log(`Field filter debug: searchField="${searchField}", job.expertise="${job.expertise}", matchesField=${matchesField}`);
    }

    return matchesSearch && matchesField && matchesLocation;
  });

  // Sort by job count (members with most jobs first)
  const sortedJobs = searchedJobs.sort((a, b) => {
    const aJobCount = parseInt(a.jobStatistics?.completedJobs || 0);
    const bJobCount = parseInt(b.jobStatistics?.completedJobs || 0);
    return bJobCount - aJobCount; // Most jobs first
  });

  const totalPages = Math.ceil(sortedJobs.length / PRODUCTS_PER_PAGE);
  const paginatedFilteredJobs = sortedJobs.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );
  const handlePageChange = (_e, value) => setCurrentPage(value);

  const handleNavigate = (id) => {
    navigate(`/admin/account?member_id=${id}`); // 👈 route to Admin Account page
    // navigate(`/admin/account`); // 👈 route to Admin Account page
  };

  return (
    <div className="flex flex-col md:flex-row lg:flex-row h-[100vh]">
      <Header />
      <ToastContainer />

      <div className="p-4 sm:p-6 flex-1 overflow-x-auto">
        <div className="flex justify-between items-center mb-3">
          <div className="flex flex-col gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-600">
              Total Members: {users?.length || 0}
            </h2>
            
          </div>
          <div className="flex flex-wrap gap-2">
            {/* Search by Alphabetical */}
            <input
              type="text"
              placeholder="Search by name, title, address..."
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 w-full sm:w-auto"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              disabled={uploading}
            />

            {/* Search by Field */}
            <select
              value={searchField}
              onChange={(e) => {
                setSearchField(e.target.value);
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 w-full sm:w-auto"
              disabled={uploading}
            >
              <option value="">Expertise</option>
              <option value="Mediation">Mediation</option>
              <option value="Arbitration">Arbitration</option>
              <option value="Conciliation">Conciliation</option>
              <option value="Negotiation">Negotiation</option>
              <option value="Facilitation">Facilitation</option>
              <option value="Legal">Legal</option>
            </select>

            {/* Search by Location */}
         

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 w-full sm:w-auto"
            >
              <option value="all">All</option>
              <option value="active">Approved</option>
              <option value="reject">Rejected</option>
            </select>

            {/* Clear Search Button */}
            {(searchTerm || searchField || searchLocation) && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSearchField("");
                  setSearchLocation("");
                  setCurrentPage(1);
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                Clear Search
              </button>
            )}
            
            {/* Debug Button */}
           
          </div>
        </div>

        {/* Table container */}
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-600">
                <th className="px-4 py-3 border-b border-gray-200">Name</th>
                <th className="px-4 py-3 border-b border-gray-200">
                  Company Name
                </th>
                <th className="px-4 py-3 border-b border-gray-200">Address</th>
                <th className="px-4 py-3 border-b border-gray-200">Contact</th>
                <th className="px-4 py-3 border-b border-gray-200">
                  Accredited By
                </th>
                <th className="px-4 py-3 border-b border-gray-200">
                  License Number
                </th>
                <th className="px-4 py-3 border-b border-gray-200">
                  Expertise Field
                </th>
                <th className="px-4 py-3 border-b border-gray-200">State</th>
                <th className="px-4 py-3 border-b border-gray-200">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-10">
                    <Box sx={{ display: "flex", justifyContent: "center" }}>
                      <CircularProgress />
                    </Box>
                  </td>
                </tr>
              ) : paginatedFilteredJobs.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="text-center font-semibold py-10 text-gray-500"
                  >
                    No records found
                  </td>
                </tr>
              ) : (
                paginatedFilteredJobs.map((job, index) => {
                  const fullName = `${toTitle(job.firstName)} ${toTitle(
                    job.lastName
                  )}`.trim();

                  return (
                    <tr
                      key={index}
                      className="hover:bg-gray-50 border-b border-gray-200 text-sm"
                    >
                      <td className="px-4 py-3 align-top">
                        <div className="flex flex-col">
                          <div className="flex gap-2 text-center items-center">
                            <div
                              onClick={() => handleNavigate(job.id)}
                              className="font-medium text-gray-900 cursor-pointer hover:text-orange-600"
                            >
                              {fullName || "-"}
                            </div>
                            <div className="text-sm font-semibold text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                              ({job.jobStatistics?.completedJobs || 0})
                            </div>
                          </div>
                          <div className="text-[10px] text-gray-500 mt-1">
                            {job.emailAddress}
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 align-top text-gray-700">
                        {job.companyName || "-"}
                      </td>
                      <td className="px-4 py-3 align-top text-gray-700">
                        {job.address || "-"}
                      </td>
                      <td className="px-4 py-3 align-top text-gray-700">
                        {job.phoneMobile || "-"}
                      </td>
                      <td className="px-4 py-3 align-top text-gray-700">
                        {job.accreditedBy || "-"}
                      </td>
                      <td className="px-4 py-3 align-top text-gray-700">
                        {job.licenseNumber || "-"}
                      </td>
                      <td className="px-4 py-3 align-top text-gray-700">
                        {job.expertise || "-"}
                      </td>

                      <td className="px-4 py-3 align-top text-gray-700">
                        {job.state || job.address?.split(',').pop()?.trim() || "-"}
                      </td>

                      <td className="px-4 py-3 align-top">
                        {job.status === "inactive" ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                handleOpenConfirm("approve", job.id)
                              }
                              className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() =>
                                handleOpenConfirm("reject", job.id)
                              }
                              className="bg-red-500 hover:bg-red-600 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-medium ${
                              job.status === "active"
                                ? "bg-green-100 text-green-700"
                                : job.status === "reject"
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full mr-2 ${
                                job.status === "active"
                                  ? "bg-green-500"
                                  : job.status === "reject"
                                  ? "bg-red-500"
                                  : "bg-gray-500"
                              }`}
                            ></span>
                            {job.status === "active" ? "Approved" : job.status === "reject" ? "Rejected" : toTitle(job.status)}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {paginatedFilteredJobs.length > 0 && totalPages > 1 && (
          <div className="flex justify-center sm:justify-end mt-5">
            <Stack spacing={2}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                variant="outlined"
                sx={{
                  "& .MuiPaginationItem-root.Mui-selected": {
                    backgroundColor: "#f97316",
                    color: "white",
                    borderColor: "orange",
                  },
                  "& .MuiPaginationItem-root.Mui-selected:hover": {
                    backgroundColor: "#ea580c",
                    borderColor: "#ff8c00",
                  },
                }}
              />
            </Stack>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <Dialog
        open={open}
        onClose={handleCancel}
        aria-labelledby="confirm-dialog-title"
      >
        <DialogTitle id="confirm-dialog-title">Confirm Action</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to{" "}
            <span className="font-bold">{selectedAction}</span> this member?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel}>Cancel</Button>
          <Button
            onClick={handleConfirm}
            variant="contained"
            color="warning"
            autoFocus
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

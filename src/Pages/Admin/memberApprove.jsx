import React, { useState, useEffect } from "react";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import Header from "../../components/header";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import axios from "axios";
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

export default function MemberApprove() {
  const baseUrl = process.env.REACT_APP_Base_Url;
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");

  // state for confirmation dialog
  const [open, setOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const getJobs = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${baseUrl}/users`);
      setUsers(data.users);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getJobs();
  }, []);

  const filteredJobs = users.filter((job) => {
    if (statusFilter === "all") return true;
    return job.status?.toLowerCase() === statusFilter.toLowerCase();
  });

  const handleMemberStatus = async (status, userId) => {
    try {
      const body = {
        userId: userId,
        action: status,
        adminNotes: `All documents verified and ${status}`,
      };
      setLoading(true);
      await axios.put(`${baseUrl}/admin/approve-user`, body, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      toast.success(`Member ${status} successfully!`);
      getJobs();
    } catch (error) {
      toast.error(`Please try again later`);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  // Open confirmation dialog
  const handleOpenConfirm = (action, userId) => {
    setSelectedAction(action);
    setSelectedUserId(userId);
    setOpen(true);
  };

  // Handle confirm
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

  const totalPages = Math.ceil(filteredJobs.length / PRODUCTS_PER_PAGE);
  const paginatedFilteredJobs = filteredJobs.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      <Header />
      <ToastContainer />

      <div className="p-4 sm:p-6 flex-1 overflow-x-auto">
        <div className="flex justify-between items-center">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">Total Members</h2>
          <div className="flex flex-wrap gap-2 mb-5">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 w-full sm:w-auto"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="reject">Reject</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="table-auto w-full text-sm min-w-[600px]">
            <thead>
              <tr className="bg-gray-50 border-b text-left text-[12px] border-b-gray-300">
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Company Name</th>
                <th className="px-4 py-2">Address</th>
                <th className="px-4 py-2">Contact</th>
                <th className="px-4 py-2">Accredited By</th>
                <th className="px-4 py-2">License Number</th>
                <th className="px-4 py-2">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-10">
                    <Box sx={{ display: "flex", justifyContent: "center" }}>
                      <CircularProgress />
                    </Box>
                  </td>
                </tr>
              ) : paginatedFilteredJobs.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="text-center font-semibold py-6 sm:py-8 md:py-20 text-gray-500 text-base sm:text-lg md:text-xl lg:text-lg"
                  >
                    No records found
                  </td>
                </tr>
              ) : (
                paginatedFilteredJobs.map((job, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 border-b border-b-gray-300 text-[12px]"
                  >
                    <td className="px-4 py-2">
                      {job.firstName.charAt(0).toUpperCase() + job.status.slice(1)}  {job.lastName.charAt(0).toUpperCase() + job.status.slice(1)}
                      <p className=" text-green-900 text-[10px] font-semibold">
                        {job.emailAddress}
                      </p>
                    </td>
                    <td className="px-4 py-2">{job.companyName}</td>
                    <td className="px-4 py-2">{job.address}</td>
                    <td className="px-4 py-2">{job.phoneMobile}</td>
                    <td className="px-4 py-2">{job.accreditedBy}</td>
                    <td className="px-4 py-2">{job.licenseNumber}</td>
                    <td className="px-4 py-2">
                      {job.status === "all" ? (
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleOpenConfirm("approve", job.id)}
                            className="bg-orange-500 hover:bg-orange-600 text-white text-10px font-semibold px-3 py-1 rounded-md"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleOpenConfirm("reject", job.id)}
                            className="bg-orange-500 hover:bg-orange-600 text-white text-10px font-semibold px-3 py-1 rounded-md"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <p
                          className={`text-center text-[8px] font-semibold px-2 rounded-3xl transition duration-200
                                ${
                                  job.status === "active"
                                    ? "bg-green-400 text-green-950"
                                    : ""
                                }
                                 ${
                                   job.status === "reject"
                                     ? "bg-red-400 text-red-950"
                                     : ""
                                 }
                              `}
                        >
                          {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                        </p>
                      )}
                    </td>
                  </tr>
                ))
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

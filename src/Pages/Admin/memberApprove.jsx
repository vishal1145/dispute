import React, { useState, useEffect } from "react";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import jobData from "../../Data/jobData.json";
import Header from "../../components/header";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// import { FiFilter, FiPlus } from "react-icons/fi";

const PRODUCTS_PER_PAGE = 10;

export default function MemberApprove() {
  const baseUrl = process.env.REACT_APP_Base_Url;
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [statusFilter, setStatusFilter] = useState("inactive");

  // Fetch data from API when component mounts

  const getJobs = async () => {
    try {
      setLoading(true); // show loader
      const { data } = await axios.get(`${baseUrl}/users`);
      setUsers(data.users);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    } finally {
      setLoading(false); // hide loader
    }
  };

  useEffect(() => {
    getJobs();
  }, []);

  const filteredJobs = users.filter(
    (job) =>
      (job.status || "inactive").toLowerCase() === statusFilter.toLowerCase()
  );

  const handleMemberStatus = async (status, userId) => {
    try {
      const body = {
        userId: userId,
        action: status,
        adminNotes: `All documents verified and ${status}`,
      };
      setLoading(true);
      const response = await axios.put(`${baseUrl}/admin/approve-user`, body, {
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
        {/* Header with job count and controls */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-5">
          {/* <div className="text-base sm:text-lg font-bold text-orange-500">
            Total Members {users.length}
          </div> */}

          <h2 className="text-xl sm:text-2xl font-bold mb-4">Job List</h2>
          <div className="flex flex-wrap gap-2">
            {/* Search */}
            <div className="flex flex-wrap gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 w-full sm:w-auto"
              >
                <option value="approve">Approve</option>
                <option value="reject">Reject</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table container for responsiveness */}
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

            {loading && (
              <div className="fixed top-[50%] left-[50%]">
                <Box sx={{ display: "flex" }}>
                  <CircularProgress />
                </Box>
              </div>
            )}

            <tbody>
              {paginatedFilteredJobs.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="text-center font-semibold py-6 sm:py-8 md:py-20 text-gray-500 
               text-base sm:text-lg md:text-xl lg:text-lg"
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
                      {job.firstName} {job.lastName}
                      <p className=" text-green-900 text-[10px] font-semibold rounded-3xl transition duration-200">
                        {job.emailAddress}
                      </p>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex flex-col">
                        <div className="flex gap-2 items-center flex-wrap">
                          <h1>{job.companyName}</h1>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2">{job.address}</td>
                    <td className="px-4 py-2">
                      <div className="flex gap-1 flex-wrap">
                        <h1>{job.phoneMobile}</h1>
                        {/* <p className="bg-[#DEEFFC] hover:bg-blue-400 text-center text-blue-700 text-[8px] px-2 font-semibold rounded-3xl transition duration-200">
                          {job.resolutionField}
                        </p> */}
                      </div>
                    </td>
                    <td className="px-4 py-2">{job.accreditedBy}</td>
                    <td className="px-4 py-2">{job.licenseNumber}</td>
                    <td className="px-4 py-2">
                      {job.status == "inactive" ? (
                        <div className="flex gap-3">
                          <button
                            onClick={() =>
                              handleMemberStatus("approve", job.id)
                            }
                            className="bg-orange-500 hover:bg-orange-600 text-white text-10px font-semibold px-3 py-1 rounded-md transition duration-200 w-full sm:w-auto"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleMemberStatus("reject", job.id)}
                            className="bg-orange-500 hover:bg-orange-600 text-white text-10px font-semibold px-3 py-1 rounded-md transition duration-200 w-full sm:w-auto"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <p className="bg-[#E0EEE0] hover:bg-green-400 text-center text-green-900 text-[8px] font-semibold px-2 rounded-3xl transition duration-200">
                          {job.status}
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
      </div>
    </div>
  );
}

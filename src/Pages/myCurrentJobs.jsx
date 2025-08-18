import React, { useState, useEffect } from "react";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import jobData from "../Data/jobData.json";
import Navbar from "../components/navbar";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSearchParams } from "react-router-dom";
// import { FiFilter, FiPlus } from "react-icons/fi";

const PRODUCTS_PER_PAGE = 10;

export default function MemberApprove() {
  const baseUrl = process.env.REACT_APP_Base_Url;
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [getJob, setGetJob] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedAction, setSelectedAction] = useState("");

  // Fetch data from API when component mounts
  const [searchParams] = useSearchParams();   // ✅ Get query params
    const userId = searchParams.get("userId");
  const getJobs = async () => {
    try {
      setLoading(true); // show loader
      const { data } = await axios.get(`${baseUrl}/jobs/status/Booked?`, {
        params: {
          userId: 1,
        },
      });
      setGetJob(data.jobs);
      console.log("Jobs fetched:", data.jobs);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    } finally {
      setLoading(false); // hide loader
    }
  };
  useEffect(() => {
      if (userId) {
        localStorage.setItem("userId", userId);
        console.log("Saved userId:", userId);
      }
    }, [userId]);
  useEffect(() => {
    getJobs();
  }, []);

  const openConfirmModal = (job, action) => {
    setSelectedJob(job);
    setSelectedAction(action);
    setShowConfirmModal(true);
  };

  const closeConfirmModal = () => {
    setShowConfirmModal(false);
    setSelectedJob(null);
    setSelectedAction("");
  };

  const confirmAction = async () => {
    if (selectedJob && selectedAction) {
      closeConfirmModal(); // Close modal immediately when action starts
      await completedJobs(selectedJob.id, selectedAction);
    }
  };

  const completedJobs = async (jobId, action) => {
    try {
      setLoading(true); //
      const postBody = {
        jobId: jobId,
        userId: "1",
        action: action,
      };
      const apiResponse = await axios.post(`${baseUrl}/jobs/action`, postBody);
      const response = apiResponse.data;
      toast.success(`Job ${action}!`);
      await getJobs();
      console.log(response);
    } catch (err) {
      toast.error(`Please try again later`);
      console.log(err);
    } finally {
      setLoading(false); // hide loader
    }
  };

  const filteredJobs = getJob.filter((job) =>
    (job.briefOverview || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <Navbar />
      <ToastContainer />

      <div className="p-4 sm:p-6 flex-1 overflow-x-auto">
        <h2 className="text-xl sm:text-2xl font-bold mb-4">My Current Jobs</h2>

        {/* Header with job count and controls */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-5">
          <div className="text-base sm:text-lg font-bold text-orange-500">
            Total Jobs {getJob.length}
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Search */}
            <input
              type="text"
              placeholder="Search..."
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 w-full sm:w-auto"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {/* Filter */}
            {/* <button className="flex items-center gap-1 border border-gray-300 rounded-md px-3 py-2 text-sm hover:bg-gray-100 w-full sm:w-auto justify-center">
              <FiFilter /> Filter
            </button> */}

            {/* Add User
            <button className="flex items-center gap-1 bg-orange-500 text-white rounded-md px-3 py-2 text-sm hover:bg-orange-600 w-full sm:w-auto justify-center">
              <FiPlus /> Add User
            </button> */}
          </div>
        </div>

        {/* Table container for responsiveness */}
        <div className="overflow-x-auto">
          <table className="table-auto w-full text-sm min-w-[600px]">
            <thead>
              <tr className="bg-gray-50 border-b text-left text-[12px] border-b-gray-300">
                <th className="px-4 py-2">Job Id</th>
                <th className="px-4 py-2">Brief overview</th>
                <th className="px-4 py-2">Venue</th>
                <th className="px-4 py-2">Duration</th>
                <th className="px-4 py-2">Intake</th>
                <th className="px-4 py-2">Remuneration</th>
                <th className="px-4 py-2">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-8">
                    <Box sx={{ display: "flex", justifyContent: "center" }}>
                      <CircularProgress />
                    </Box>
                  </td>
                </tr>
              ) : paginatedFilteredJobs.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="text-center font-semibold py-6 sm:py-8 md:py-10 text-gray-500 
               text-base sm:text-lg md:text-xl lg:text-2xl"
                  >
                    No jobs found
                  </td>
                </tr>
              ) : (
                paginatedFilteredJobs.map((job, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 border-b border-b-gray-300 text-[12px]"
                  >
                    <td className="px-4 py-2">{job.id}</td>
                    <td className="px-4 py-2">
                      <div className="flex flex-col">
                        <div className="flex gap-2 items-center flex-wrap">
                          <h1>{job.briefOverview}</h1>
                          <p className="bg-[#E0EEE0] hover:bg-green-400 text-center text-green-900 text-[8px] font-semibold px-2 rounded-3xl transition duration-200">
                            {job.status}
                          </p>
                        </div>
                        <p className="text-[10px]">{job.date}</p>
                      </div>
                    </td>
                    <td className="px-4 py-2">{job.venue}</td>
                    <td className="px-4 py-2">
                      <div className="flex gap-1 flex-wrap">
                        <h1>{job.duration}</h1>
                        <p className="bg-[#DEEFFC] hover:bg-blue-400 text-center text-blue-700 text-[8px] px-2 font-semibold rounded-3xl transition duration-200">
                          {job.resolutionField}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-2">{job.intake}</td>
                    <td className="px-4 py-2">
                      <div className="font-medium">
                        $ {parseInt(job.remuneration || 0).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex gap-3">
                        <button
                          onClick={() => openConfirmModal(job, "Completed")}
                          className="bg-orange-500 hover:bg-orange-600 text-white text-10px font-semibold px-3 py-1 rounded-md transition duration-200 w-full sm:w-auto"
                        >
                          Completed
                        </button>
                        <button
                          onClick={() => openConfirmModal(job, "Aborted")}
                          className="bg-orange-500 hover:bg-orange-600 text-white text-10px font-semibold px-3 py-1 rounded-md transition duration-200 w-full sm:w-auto"
                        >
                          Aborted
                        </button>
                      </div>
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

      {/* Confirmation Modal */}
      {showConfirmModal && selectedJob && selectedAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Confirm Action</h3>
            <p className="text-sm mb-4">
              Are you sure you want to {selectedAction} this job?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={closeConfirmModal}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from "react";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import Navbar from "../components/navbar";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PRODUCTS_PER_PAGE = 10;
const STORAGE_KEY = "user_id";

export default function MemberApprove() {
  const baseUrl = process.env.REACT_APP_Base_Url;
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [getJob, setGetJob] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedAction, setSelectedAction] = useState("");

  // ✅ Always use only "user_id" from localStorage
  const userId = localStorage.getItem(STORAGE_KEY);

  const getJobs = async () => {
    if (!userId) {
      console.warn("⚠️ No user_id found in localStorage, cannot fetch jobs");
      setGetJob([]);
      return;
    }

    try {
      setLoading(true);
      console.log("🚀 Fetching current jobs for userId:", userId);
      const { data } = await axios.get(`${baseUrl}/jobs/status/Booked`, {
        params: { userId },
      });

      if (data && Array.isArray(data.jobs)) {
        setGetJob(data.jobs);
        console.log("📊 Jobs loaded:", data.jobs.length);
      } else {
        console.warn("⚠️ No jobs data in response:", data);
        setGetJob([]);
      }
    } catch (err) {
      console.error("❌ Error fetching current jobs:", err);
      toast.error(
        `Failed to fetch current jobs: ${
          err.response?.data?.message || err.message || "Unknown error"
        }`
      );
      setGetJob([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

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
      closeConfirmModal();
      await completedJobs(selectedJob.id, selectedAction);
    }
  };

  const completedJobs = async (jobId, action) => {
    if (!userId) {
      toast.error("User ID not found. Cannot complete job.");
      return;
    }

    try {
      setLoading(true);
      const postBody = { jobId, userId, action };
      const apiResponse = await axios.post(`${baseUrl}/jobs/action`, postBody);
      toast.success(`Job ${action}!`);
      await getJobs();
      console.log("✅ Job action response:", apiResponse.data);
    } catch (err) {
      toast.error("Please try again later");
      console.error("❌ Error completing job:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = getJob.filter((job) =>
    (job.briefOverview || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / PRODUCTS_PER_PAGE));
  const paginatedFilteredJobs = filteredJobs.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  const handlePageChange = (event, value) => setCurrentPage(value);

  return (
    <div className="flex flex-col lg:flex-row h-screen">
      <Navbar />
      <ToastContainer />

      <div className="p-4 sm:p-6 flex-1 overflow-y-auto">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-600">
          My Current Jobs
        </h2>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-5">
          <div className="flex flex-col gap-1">
            <div className="text-base font-medium text-gray-600">
              Total Jobs {getJob.length}
            </div>
            {/* <div className="text-xs text-gray-500">
              Using User ID: <span className="font-semibold">{userId || "N/A"}</span>
            </div> */}
          </div>

          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              placeholder="Search..."
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 w-full sm:w-auto"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-600">
                <th className="px-4 py-3 border-b border-gray-200">Job Id</th>
                <th className="px-4 py-3 border-b border-gray-200">Brief Overview</th>
                <th className="px-4 py-3 border-b border-gray-200">Venue</th>
                <th className="px-4 py-3 border-b border-gray-200">Duration</th>
                <th className="px-4 py-3 border-b border-gray-200">Intake</th>
                <th className="px-4 py-3 border-b border-gray-200">Remuneration</th>
                <th className="px-4 py-3 border-b border-gray-200">Action</th>
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
                  <td colSpan="7" className="text-center font-semibold py-6 text-gray-500">
                    {userId ? "No jobs found" : "User ID not found in localStorage"}
                  </td>
                </tr>
              ) : (
                paginatedFilteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50 border-b border-gray-200 text-sm">
                    <td className="px-4 py-3 align-top text-gray-900">{job.id}</td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex flex-col">
                        <div className="font-medium text-gray-900">{job.briefOverview}</div>
                        <div className="text-[10px] text-gray-500 mt-1">{job.date}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top text-gray-700">{job.venue}</td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex flex-col gap-1">
                        <div className="font-medium text-gray-900">{job.duration}</div>
                        <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-1 rounded-full font-medium inline-block w-fit">
                          {job.resolutionField}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top text-gray-700">
                      {job.intakeDetails || job.intake || "-"}
                    </td>
                    <td className="px-4 py-3 align-top text-gray-900 font-medium">
                      ${parseInt(job.remuneration || 0, 10).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openConfirmModal(job, "Completed")}
                          className="bg-green-500 hover:bg-green-600 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors"
                        >
                          Completed
                        </button>
                        <button
                          onClick={() => openConfirmModal(job, "Aborted")}
                          className="bg-red-500 hover:bg-red-600 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors"
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

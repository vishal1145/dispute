import React, { useState, useEffect, useMemo } from "react";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import Navbar from "../components/navbar";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PRODUCTS_PER_PAGE = 10;
const STORAGE_KEY = "user_id";

export default function JobList() {
  const baseUrl = process.env.REACT_APP_Base_Url;

  const [allJobLists, setAllJobList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  // Prefer URL user_id, else fallback to localStorage. Do NOT write here.
  const [searchParams] = useSearchParams();
  const qpUserId = searchParams.get("user_id");
  const effectiveUserId = useMemo(
    () => qpUserId || localStorage.getItem(STORAGE_KEY) || null,
    [qpUserId]
  );

  // Load jobs (userId not required for listing)
  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseUrl]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      console.log("🚀 Fetching jobs from:", `${baseUrl}/jobs`);
      console.log("👤 Effective userId (read-only):", effectiveUserId);

      const { data } = await axios.get(`${baseUrl}/jobs`);
      console.log("✅ Jobs API Response:", data);

      if (data && Array.isArray(data.jobs)) {
        setAllJobList(data.jobs);
        console.log("📊 Jobs loaded:", data.jobs.length);
      } else {
        console.warn("⚠️ No jobs data in response:", data);
        setAllJobList([]);
      }
    } catch (err) {
      console.error("❌ Error fetching jobs:", err);
      toast.error(
        `Failed to fetch jobs: ${err.response?.data?.message || err.message || "Unknown error"}`
      );
      setAllJobList([]);
    } finally {
      setLoading(false);
    }
  };

  const openConfirmModal = (job) => {
    setSelectedJob(job);
    setShowConfirmModal(true);
  };

  const closeConfirmModal = () => {
    setShowConfirmModal(false);
    setSelectedJob(null);
  };

  const confirmBookJob = async () => {
    if (selectedJob) {
      closeConfirmModal();
      await bookedJobs(selectedJob.id);
    }
  };

  const bookedJobs = async (jobId) => {
    try {
      setLoading(true);

      // Must have an effective user id (URL or localStorage)
      if (!effectiveUserId) {
        toast.error("User ID not found. Please open the dashboard link with your user_id.");
        console.error("No effectiveUserId available for booking");
        return;
      }

      const updateBody = {
        userId: effectiveUserId, // Read-only value
        status: "Booked",
      };

      console.log("📝 Booking job:", jobId, "with body:", updateBody);
      const apiResponse = await axios.put(`${baseUrl}/jobs/${jobId}/status`, updateBody);

      console.log("✅ Booking successful:", apiResponse.data);
      toast.success("Job booked successfully!");

      // Refresh list
      await fetchJobs();
    } catch (err) {
      console.error("❌ Booking failed:", err);
      const status = err.response?.status;
      if (status === 401) toast.error("Authentication failed. Please login again.");
      else if (status === 404) toast.error("Job not found. It may have been removed.");
      else if (status === 400) toast.error("Invalid request. Please check your data.");
      else if (status === 500) toast.error("Server error. Please try again later.");
      else if (err.code === "NETWORK_ERROR") toast.error("Network error. Check your connection.");
      else toast.error(`Booking failed: ${err.response?.data?.message || err.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  // Filter + paginate
  const filteredJobs = allJobLists?.filter((job) =>
    (job.briefOverview || "").toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil((filteredJobs?.length || 0) / PRODUCTS_PER_PAGE);
  const paginatedFilteredJobs = filteredJobs?.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  const handlePageChange = (event, value) => setCurrentPage(value);

  return (
    <div className="flex flex-col lg:flex-row h-screen">
      <Navbar />
      <ToastContainer />

      <div className="p-4 sm:p-6 flex-1 overflow-y-auto">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-600">Job Schedule</h2>

        {/* Header with job count and controls */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-5">
          <div className="flex flex-col gap-1">
            <div className="text-base font-medium text-gray-600">
              Available Jobs {allJobLists?.length}
            </div>
         
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
              ) : paginatedFilteredJobs?.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center font-semibold py-6 text-gray-500">
                    No jobs found
                  </td>
                </tr>
              ) : (
                paginatedFilteredJobs?.map((job) => (
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
                    <td className="px-4 py-3 align-top text-gray-700">{job.intakeDetails}</td>
                    <td className="px-4 py-3 align-top text-gray-900 font-medium">
                      ${" "}{parseInt(job.remuneration || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <button
                        onClick={() => openConfirmModal(job)}
                        className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors"
                      >
                        Book
                      </button>
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
      {showConfirmModal && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Confirm Booking</h3>
            <p className="text-sm mb-4 text-gray-600">
              Are you sure you want to book this job? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={closeConfirmModal}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={confirmBookJob}
                disabled={loading}
                className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? "Booking..." : "Confirm Booking"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

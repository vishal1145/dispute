import React, { useState, useEffect } from "react";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import Navbar from "../components/navbar";
import { useSearchParams } from "react-router-dom";
// import { FiFilter, FiPlus } from "react-icons/fi";
import axios from "axios";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PRODUCTS_PER_PAGE = 10;

export default function JobList() {
  // const baseUrl = "http://192.168.1.29:8000/wp-json/wp-rest-api-demo/v1";
  const baseUrl = process.env.REACT_APP_Base_Url;
  const [allJobLists, setAllJobList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  // const [userId, setUserId] = useState("");
  const [status, setStatus] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [searchParams] = useSearchParams(); // ✅ Get query params
  const qpUserId = searchParams.get("userId");
  
  // Prefer localStorage userId; fallback to "1" for dev
  const userId = localStorage.getItem("userId") ;
    console.log("Using userId:", userId);
  
  // Fetch data from API when component mounts
  useEffect(() => {
    if (qpUserId) {
      localStorage.setItem("userId", qpUserId);
      console.log("Saved userId:", qpUserId);
    }
  }, [qpUserId]);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true); // show loader
      const { data } = await axios.get(`${baseUrl}/jobs`);
      setAllJobList(data.jobs);
      console.log("Jobs fetched:", data.jobs);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    } finally {
      setLoading(false); // hide loader
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
      closeConfirmModal(); // Close modal immediately when action starts
      await bookedJobs(selectedJob.id);
    }
  };

  const bookedJobs = async (jobId) => {
    try {
      setLoading(true); // show loader
      const updateBody = {
        userId: userId, // Use dynamic user ID from localStorage
        status: "Booked",
      };
      const apiResponse = await axios.put(
        `${baseUrl}/jobs/${jobId}/status`,
        updateBody
      );
      const response = apiResponse.data;
      console.log(response);
      toast.success(`Booked successfully!`);
      await fetchJobs();
    } catch (err) {
      toast.error(`Please try again later`);
      console.log(err);
    } finally {
      setLoading(false); // hide loader
    }
  };

  // Filter based on search
  const filteredJobs = allJobLists?.filter((job) =>
    (job.briefOverview || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredJobs?.length / PRODUCTS_PER_PAGE);

  const paginatedFilteredJobs = filteredJobs?.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

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

            {/* <button className="flex items-center gap-1 border border-gray-300 rounded-md px-3 py-2 text-sm hover:bg-gray-100 w-full sm:w-auto justify-center">
              <FiFilter /> Filter
            </button> */}
            {/* 
            <button className="flex items-center gap-1 bg-orange-500 text-white rounded-md px-3 py-2 text-sm hover:bg-orange-600 w-full sm:w-auto justify-center">
              <FiPlus /> Add User
            </button> */}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-600">
                <th className="px-4 py-3 border-b border-gray-200">Job Id</th>
                <th className="px-4 py-3 border-b border-gray-200">
                  Brief Overview
                </th>
                <th className="px-4 py-3 border-b border-gray-200">Venue</th>
                <th className="px-4 py-3 border-b border-gray-200">Duration</th>
                <th className="px-4 py-3 border-b border-gray-200">Intake</th>
                <th className="px-4 py-3 border-b border-gray-200">
                  Remuneration
                </th>
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
                  <td
                    colSpan="7"
                    className="text-center font-semibold py-6 sm:py-8 md:py-10 text-gray-500 
               text-base sm:text-lg md:text-xl lg:text-2xl"
                  >
                    No jobs found
                  </td>
                </tr>
              ) : (
                paginatedFilteredJobs?.map((job, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 border-b border-gray-200 text-sm"
                  >
                    <td className="px-4 py-3 align-top text-gray-900">
                      {job.id}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex flex-col">
                        <div className="font-medium text-gray-900">
                          {job.briefOverview}
                        </div>
                        <div className="text-[10px] text-gray-500 mt-1">
                          {job.date}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top text-gray-700">
                      {job.venue}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex flex-col gap-1">
                        <div className="font-medium text-gray-900">
                          {job.duration}
                        </div>
                        <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-1 rounded-full font-medium inline-block w-fit">
                          {job.resolutionField}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top text-gray-700">
                      {job.intakeDetails}
                    </td>
                    <td className="px-4 py-3 align-top text-gray-900 font-medium">
                      $ {parseInt(job.remuneration || 0).toLocaleString()}
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
            <p className="text-sm mb-4">
              Are you sure you want to book the job titled: "
              {selectedJob.briefOverview}"?
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
                className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
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

import React, { useState, useEffect } from "react";
import completedJob from "../Data/completedjob.json";
import Navbar from "../components/navbar";
// import { FiFilter, FiPlus } from "react-icons/fi";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import axios from "axios";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import { useSearchParams } from "react-router-dom";  

const PRODUCTS_PER_PAGE = 10;

export default function MyCompletedJobs() {
  const baseUrl = process.env.REACT_APP_Base_Url;
  const [completedJobs, setCompletedJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();   // ✅ Get query params
  const qpUserId = searchParams.get("userId");
  
  // Prefer localStorage userId; fallback to "1" for dev
  const userId = localStorage.getItem("userId");
  
  const myJobs = async () => {
    try {
      setLoading(true); // show loader
      const { data } = await axios.get(`${baseUrl}/jobs/completed/user/${userId}`);
      setCompletedJobs(data.jobs);
      console.log("Jobs fetched:", data.jobs);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    } finally {
      setLoading(false); // hide loader
    }
  };
  
  useEffect(() => {
    if (qpUserId) {
      localStorage.setItem("userId", qpUserId);
      console.log("Saved userId:", qpUserId);
    }
  }, [qpUserId]);
  
  useEffect(() => {
    myJobs();
  }, [userId]); // Re-fetch when userId changes

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredJobs = completedJobs.filter((job) =>
    (job.overview || "").toLowerCase().includes(searchTerm.toLowerCase())
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
    <div className="flex flex-col md:flex-row h-screen">
      <Navbar />

      <div className="p-4 md:p-6 w-full overflow-y-auto">
        {/* Header */}
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-600">
          My Completed Jobs
        </h2>

        {/* Top controls */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-5">
          <div className="flex flex-col gap-1">
            <div className="text-base font-medium text-gray-600">
              Total Jobs {completedJobs.length}
            </div>
         
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <input
              type="text"
              placeholder="Search..."
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 w-full sm:w-auto"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {/* <button className="flex items-center justify-center gap-1 border border-gray-300 rounded-md px-3 py-2 text-sm hover:bg-gray-100">
              <FiFilter /> Filter
            </button> */}

            {/* <button className="flex items-center justify-center gap-1 bg-orange-500 text-white rounded-md px-3 py-2 text-sm hover:bg-orange-600">
              <FiPlus /> Add User
            </button> */}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-600">
                <th className="px-4 py-3 border-b border-gray-200">Job ID</th>
                <th className="px-4 py-3 border-b border-gray-200">Brief Overview</th>
                <th className="px-4 py-3 border-b border-gray-200">Venue</th>
                <th className="px-4 py-3 border-b border-gray-200">Duration</th>
                <th className="px-4 py-3 border-b border-gray-200">Intake Details</th>
                <th className="px-4 py-3 border-b border-gray-200">Remuneration</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-8">
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
                paginatedFilteredJobs.map((job) => (
                  <tr
                    key={job.id}
                    className="hover:bg-gray-50 border-b border-gray-200 text-sm"
                  >
                    <td className="px-4 py-3 align-top text-gray-900">{job.id}</td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex flex-col">
                        <div className="font-medium text-gray-900">
                          {job.briefOverview}
                        </div>
                        <div className="text-[10px] text-gray-500 mt-1">
                          {job.jobDate}
                        </div>
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
                      $ {parseInt(job.remuneration || 0).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-center md:justify-end mt-5">
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

import React, { useState, useEffect, useMemo } from "react";
import Navbar from "../components/navbar";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import axios from "axios";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import { useSearchParams } from "react-router-dom";

const PRODUCTS_PER_PAGE = 10;
const STORAGE_KEY = "user_id";

export default function MyCompletedJobs() {
  const baseUrl = process.env.REACT_APP_Base_Url;

  const [completedJobs, setCompletedJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // ✅ Read-only user id: prefer URL ?user_id=... else localStorage
  const [searchParams] = useSearchParams();
  const qpUserId = searchParams.get("user_id");
  const effectiveUserId = useMemo(
    () => qpUserId || localStorage.getItem(STORAGE_KEY) || null,
    [qpUserId]
  );

  // Fetch completed jobs for this user
  const myJobs = async () => {
    if (!baseUrl) {
      console.error("Base URL is missing. Set REACT_APP_Base_Url");
      return;
    }
    if (!effectiveUserId) {
      console.warn("No user_id available to fetch completed jobs");
      setCompletedJobs([]);
      return;
    }

    try {
      setLoading(true);
      console.log("🔎 Fetching completed jobs:", `${baseUrl}/jobs/completed/user/${effectiveUserId}`);
      const { data } = await axios.get(`${baseUrl}/jobs/completed/user/${effectiveUserId}`);

      if (data && Array.isArray(data.jobs)) {
        setCompletedJobs(data.jobs);
        console.log("✅ Jobs fetched:", data.jobs.length);
      } else {
        console.warn("⚠️ Unexpected response shape:", data);
        setCompletedJobs([]);
      }
    } catch (err) {
      console.error("❌ Error fetching jobs:", err);
      setCompletedJobs([]);
    } finally {
      setLoading(false);
    }
  };

  // Load when baseUrl or effectiveUserId changes
  useEffect(() => {
    myJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseUrl, effectiveUserId]);

  // Filter + pagination
  const filteredJobs = (completedJobs || []).filter((job) =>
    (job.briefOverview || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil((filteredJobs.length || 0) / PRODUCTS_PER_PAGE));

  const paginatedFilteredJobs = filteredJobs.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  const handlePageChange = (event, value) => setCurrentPage(value);

  return (
    <div className="flex flex-col md:flex-row h-screen">
      <Navbar />

      <div className="p-4 md:p-6 w-full overflow-y-auto">
        {/* Header */}
        <h2 className="text-xl sm:text-2xl font-bold mb-1 text-gray-600">My Completed Jobs</h2>
        <div className="text-xs text-gray-500 mb-4">
          Using User ID: <span className="font-semibold">{effectiveUserId || "N/A"}</span>
        </div>

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
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // reset to first page on new search
              }}
            />
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
                    colSpan="6"
                    className="text-center font-semibold py-8 text-gray-500"
                  >
                    {effectiveUserId
                      ? "No jobs found"
                      : "User ID not found. Open link with ?user_id=... or ensure it’s saved in localStorage."}
                  </td>
                </tr>
              ) : (
                paginatedFilteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50 border-b border-gray-200 text-sm">
                    <td className="px-4 py-3 align-top text-gray-900">{job.id}</td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex flex-col">
                        <div className="font-medium text-gray-900">{job.briefOverview}</div>
                        <div className="text-[10px] text-gray-500 mt-1">{job.jobDate}</div>
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
                      ${" "}{parseInt(job.remuneration || 0, 10).toLocaleString()}
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

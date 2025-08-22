import React, { useState, useEffect, useRef } from "react";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import Header from "../../components/header";
import axios from "axios";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

const PRODUCTS_PER_PAGE = 10;

export default function JobList() {
  const baseUrl = process.env.REACT_APP_Base_Url;
  const [allJobLists, setAllJobList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false); // single loader in list
  const [excelFile, setExcelFile] = useState(null);
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false); // button text only
  const SAMPLE_URL = `${process.env.PUBLIC_URL}/sample-posts (1) (2).xlsx`;
  
  const fetchJobs = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${baseUrl}/admin/jobs/all`);
      setAllJobList(data?.jobs || []);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const bookedJobs = async (jobId) => {
    try {
      const updateBody = {
        userId: "1",
        status: "Booked",
      };
      const apiResponse = await axios.put(
        `${baseUrl}/jobs/${jobId}/status`,
        updateBody
      );
      const response = apiResponse.data;
      console.log(response);
    } catch (err) {
      console.log(err);
    }
  };

  // Filter based on search
  const filteredJobs = allJobLists?.filter((job) =>
    (job.briefOverview || "").toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil((filteredJobs?.length || 0) / PRODUCTS_PER_PAGE);
  const paginatedFilteredJobs = filteredJobs?.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  const handlePageChange = (_e, value) => setCurrentPage(value);
  const handleExcelUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setExcelFile(file);
    uploadExcel(file);
  };

  // Upload -> refresh list immediately
  const uploadExcel = async (file) => {
    const formData = new FormData();
    formData.append("excel_file", file);
    try {
      setUploading(true);
      await axios.post(`${baseUrl}/jobs/import-excel`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchJobs();
      setCurrentPage(1);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      // Don't clear excelFile here - keep it for display purposes
      // setExcelFile(null);
    }
  };

  // helpers
  const statusClass = (s) =>
    s === "Booked"
      ? "bg-blue-100 text-blue-700"
      : s === "Available"
      ? "bg-yellow-100 text-yellow-800"
      : s === "Completed"
      ? "bg-green-100 text-green-700"
      : s === "Aborted"
      ? "bg-red-100 text-red-700"
      : "bg-gray-100 text-gray-700";

  return (
    <div className="flex flex-col md:flex-row lg:flex-row h-[100vh]">
      <Header />

      <div className="p-4 sm:p-6 flex-1 overflow-x-auto">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-600">
          Job List
        </h2>

        {/* Top controls */}
        <div className="flex flex-col items-center sm:flex-row sm:justify-between sm:items-center gap-3 mb-5">
          <div className="text-[16px] font-medium text-gray-700">
            Total Jobs {allJobLists?.length || 0}
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            {/* Download sample */}

            <a
              href={SAMPLE_URL}
              download="sample-posts (1) (2).xlsx"
              className="text-gray-600 underline hover:text-gray-800 transition-colors"
              style={{
                textDecoration: "underline",
                color: "gray",
                border: "none",
              }}
            >
              Download Sample File
            </a>
            {/* Upload */}
            <button
              type="button"
              onClick={handleExcelUploadClick}
              className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-60"
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Upload Excel"}
            </button>

            <input
              type="text"
              placeholder="Search..."
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 w-full sm:w-auto"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              disabled={uploading}
            />

            <input
              type="file"
              accept=".xlsx,.xls"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
            {excelFile && (
              <span className="ml-3 text-sm text-gray-700">
                {excelFile.name}
              </span>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table
            className="w-full text-sm border-collapse"
            style={{ minWidth: "900px" }}
          >
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
                <th className="px-4 py-3 border-b border-gray-200">Status</th>
                <th className="px-4 py-3 border-b border-gray-200">
                  Booked By
                </th>
              </tr>
            </thead>

            {/* {loading && (
              <div className="fixed top-[50%] left-[50%]">
            <Box sx={{ display: "flex" }}>
              <CircularProgress />
            </Box>
          </div>
            )} */}

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
                    className="text-center font-semibold py-6 sm:py-8 md:py-20 text-gray-500 
               text-base sm:text-lg md:text-xl lg:text-lg"
                  >
                    No record found
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
                          {job.jobDate}
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
                        <div>
                          <p className="inline-flex items-center bg-blue-100 text-blue-700 text-[10px] px-3 py-1 rounded-full font-medium">
                            {job.resolutionField}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top text-gray-700">
                      {job.intakeDetails}
                    </td>
                    <td className="px-4 py-3 align-top text-gray-900 font-medium">
                      $ {parseInt(job.remuneration || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-medium
                          ${
                            job.status === "Booked"
                              ? "bg-blue-100 text-blue-700"
                              : job.status === "Available"
                              ? "bg-yellow-100 text-yellow-700"
                              : job.status === "Completed"
                              ? "bg-green-100 text-green-700"
                              : job.status === "Aborted"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-700"
                          }
                        `}
                      >
                        <span
                          className={`w-2 h-2 rounded-full mr-2 ${
                            job.status === "Booked"
                              ? "bg-blue-500"
                              : job.status === "Available"
                              ? "bg-yellow-500"
                              : job.status === "Completed"
                              ? "bg-green-500"
                              : job.status === "Aborted"
                              ? "bg-red-500"
                              : "bg-gray-500"
                          }`}
                        ></span>
                        {job.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top text-gray-700">
                      {job.userName}
                    </td>

                    {/* <td className="px-4 py-2">
                    <button
                      onClick={() => bookedJobs(job.id)}
                      className="bg-orange-500 hover:bg-orange-600 text-white text-10px font-semibold px-3 py-1 rounded-md transition duration-200 w-full sm:w-auto"
                    >
                      Book
                    </button>
                  </td> */}
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
    </div>
  );
}

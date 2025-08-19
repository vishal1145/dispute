import React, { useState, useEffect, useRef } from "react";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import Header from "../../components/header";
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
  const [userId, setUserId] = useState("");
  const [status, setStatus] = useState("");
  const [excelFile, setExcelFile] = useState(null);
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  // Fetch data from API when component mounts

  const fetchJobs = async () => {
    try {
      setLoading(true); // show loader
      const { data } = await axios.get(`${baseUrl}/admin/jobs/all`);
      setAllJobList(data.jobs);
      console.log("Jobs fetched:", data.jobs);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    } finally {
      setLoading(false); // hide loader
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

  const totalPages = Math.ceil(filteredJobs?.length / PRODUCTS_PER_PAGE);

  const paginatedFilteredJobs = filteredJobs?.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleExcelUploadClick = () => {
    fileInputRef.current.click(); // trigger hidden input
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setExcelFile(file);
      uploadExcel(file);
    }
  };

  // Upload file API
  const uploadExcel = async (file) => {
    const formData = new FormData();
    formData.append("excel_file", file);

    try {
      setUploading(true);
      const response = await axios.post(
        `${baseUrl}/jobs/import-excel`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Cookie: "PHPSESSID=aam7r67kt704mgi5jnfil8nfl8",
          },
        }
      );

      console.log("Upload success:", response.data);
      alert("Excel uploaded successfully!");
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload Excel file");
    } finally {
      setUploading(false);
    }
  };
  // const handleFileChange = (e) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     setExcelFile(file);
  //     toast.info(`Selected file: ${file.name}`);
  //     // You can handle uploading the file here if needed
  //   }
  // };

  return (
    <div className="flex flex-col lg:flex-row h-[100vh]">
      <Header />

      <div className="p-4 sm:p-6 flex-1 overflow-x-auto">
        <h2 className="text-xl sm:text-2xl font-bold mb-4">Job List</h2>

        {/* Header with job count and controls */}
        <div className="flex flex-col items-center sm:flex-row sm:justify-between sm:items-center gap-3 mb-5">
          <div className="text-base sm:text-lg font-bold text-orange-500">
            Total Jobs {allJobLists?.length}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleExcelUploadClick}
              className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Upload Excel"}
            </button>

            <input
              type="text"
              placeholder="Search..."
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 w-full sm:w-auto"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <div className="w-full max-w-3xl mt-4 flex justify-start">
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
        </div>

        {/* Table */}
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
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Booked By</th>
                {/* <th className="px-4 py-2">Action</th> */}
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
                    className="hover:bg-gray-50 border-b border-b-gray-300 text-[12px]"
                  >
                    <td className="px-4 py-2">{job.id}</td>
                    <td className="px-4 py-2">
                      <div className="flex flex-col">
                        <div className="flex gap-2 items-center flex-wrap">
                          <h1>{job.briefOverview}</h1>
                        </div>
                        <p className="text-[10px]">{job.jobDate}</p>
                      </div>
                    </td>
                    <td className="px-4 py-2">{job.venue}</td>
                    <td className="px-4 py-2">
                      <div className="flex gap-1 flex-wrap">
                        <h1>{job.duration}</h1>
                        <p className="bg-blue-400 text-center text-blue-950 text-[8px] px-2 font-semibold rounded-3xl transition duration-200">
                          {job.resolutionField}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-2">{job.intakeDetails}</td>
                    <td className="px-4 py-2">
                      $ {parseFloat(job.remuneration).toLocaleString("en-US")}
                    </td>
                    <td className="px-4 py-2">
                      <div>
                        <p
                          className={`text-center text-[8px] font-semibold px-2 rounded-3xl transition duration-200
                                ${
                                  job.status === "Booked"
                                    ? "bg-blue-400 text-blue-950"
                                    : ""
                                }
                                ${
                                  job.status === "Available"
                                    ? "bg-yellow-400 text-yellow-950"
                                    : ""
                                }
                                ${
                                  job.status === "Completed"
                                    ? "bg-green-400 text-green-950"
                                    : ""
                                }
                                 ${
                                   job.status === "Aborted"
                                     ? "bg-red-400 text-red-950"
                                     : ""
                                 }
                              `}
                        >
                          {job.status}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-2">{job.userName}</td>

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

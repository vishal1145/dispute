import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function CreateJob() {
  const baseUrl = process.env.REACT_APP_Base_Url;
  const navigate = useNavigate();

  const [jobDate, setJobDate] = useState("");
  const [resolutionField, setResolutionField] = useState("");
  const [venue, setVenue] = useState("");
  const [remuneration, setRemuneration] = useState(null);
  const [duration, setDuration] = useState("");
  const [briefOverview, setBriefOverview] = useState("");
  const [intakeDetails, setIntakeDetails] = useState("");
  const [status, setStatus] = useState("");

  // error state
  const [errors, setErrors] = useState({});

  const [loading, setLoading] = useState(false); // loader state

  // const [excelFile, setExcelFile] = useState(null);
  // const fileInputRef = useRef(null);

  const handleJobSchedule = () => {
    navigate("/admin/job-list");
  };

  const validateForm = () => {
    let newErrors = {};

    if (!jobDate) newErrors.jobDate = "Job date is required";
    if (!resolutionField)
      newErrors.resolutionField = "Resolution field is required";
    if (!venue) newErrors.venue = "Venue is required";
    if (!remuneration || remuneration <= 0)
      newErrors.remuneration = "Enter a valid remuneration";
    if (!duration) newErrors.duration = "Duration is required";
    if (!status) newErrors.status = "Status is required";
    if (!briefOverview) newErrors.briefOverview = "Brief overview is required";
    if (!intakeDetails) newErrors.intakeDetails = "Intake details are required";

    setErrors(newErrors);

    // return true if no errors
    return Object.keys(newErrors).length === 0;
  };

  // const handleExcelUploadClick = () => {
  //   fileInputRef.current.click(); // trigger hidden input
  // };

  // const handleFileChange = (e) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     setExcelFile(file);
  //     toast.info(`Selected file: ${file.name}`);
  //     // You can handle uploading the file here if needed
  //   }
  // };

  const isFormValid =
    jobDate &&
    resolutionField &&
    venue &&
    remuneration > 0 &&
    duration &&
    status &&
    briefOverview &&
    intakeDetails;

  const handleCreateJobs = async (e) => {
    e.preventDefault();
    if (!validateForm()) return; // stop if invalid

    setLoading(true); // start loader
    toast.info("Creating job...", { autoClose: 2000 });

    try {
      const body = {
        jobDate,
        resolutionField,
        venue,
        remuneration,
        duration,
        briefOverview,
        intakeDetails,
        status,
      };
      const apiResponse = await axios.post(`${baseUrl}/jobs`, body);
      console.log(apiResponse.data);

      toast.success("Job created successfully!");
      navigate("/admin/job-list");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create job. Please try again.");
    } finally {
      setLoading(false); // stop loader
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-6">
      <ToastContainer />
      {/* Header */}
      <div
        className="w-full max-w-full bg-cover bg-center h-[250px] rounded-lg flex items-center justify-center"
        style={{ backgroundImage: "url('/images/job.jpg')" }}
      >
        <div className="flex flex-col gap-5 items-center">
          <h1 className="text-3xl font-bold text-white drop-shadow-lg">
            Post a New Job
          </h1>
          <p className="text-white">
            Add job details for dispute resolution services
          </p>
        </div>
      </div>

      {/* Back Button */}
      <div className="w-full max-w-3xl mt-5 flex items-center justify-start">
        <button
          onClick={handleJobSchedule}
          className="flex items-center gap-2 px-4 py-2 text-orange-500 shadow-sm rounded-lg hover:bg-orange-50 transition"
        >
          <img
            src="/images/left-direction.svg"
            alt="direction"
            className="w-6 h-6"
          />
          <span>Back</span>
        </button>
      </div>

      {/* Form */}
      <div className="bg-white mt-6 shadow-md rounded-lg p-6 w-full max-w-3xl">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-600">
          Job Details
        </h2>
        <form
          onSubmit={handleCreateJobs}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* Job Date */}
          <div>
            <label className="block text-sm font-medium mb-1">Job Date</label>
            <input
              type="date"
              value={jobDate}
              onChange={(e) => setJobDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className={`w-full border ${
                errors.jobDate ? "border-red-500" : "border-gray-300"
              } rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500`}
            />
            {errors.jobDate && (
              <p className="text-red-500 text-sm">{errors.jobDate}</p>
            )}
          </div>

          {/* Resolution Type */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Resolution Field
            </label>
            <select
              value={resolutionField}
              onChange={(e) => setResolutionField(e.target.value)}
              className={`w-full border ${
                errors.resolutionField ? "border-red-500" : "border-gray-300"
              } rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500`}
            >
              <option value="">Select Resolution Type</option>
              <option value="Mediation">Mediation</option>
              <option value="Arbitration">Arbitration</option>
              <option value="Negotiation">Negotiation</option>
            </select>
            {errors.resolutionField && (
              <p className="text-red-500 text-sm">{errors.resolutionField}</p>
            )}
          </div>

          {/* Venue */}
          <div>
            <label className="block text-sm font-medium mb-1">Venue</label>
            <input
              type="text"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="Enter venue"
              className={`w-full border ${
                errors.venue ? "border-red-500" : "border-gray-300"
              } rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500`}
            />
            {errors.venue && (
              <p className="text-red-500 text-sm">{errors.venue}</p>
            )}
          </div>

          {/* Remuneration */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Remuneration
            </label>
            <input
              type="number"
              value={remuneration}
              onChange={(e) => setRemuneration(e.target.value)}
              placeholder="Enter remuneration"
              className={`w-full border ${
                errors.remuneration ? "border-red-500" : "border-gray-300"
              } rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500`}
            />
            {errors.remuneration && (
              <p className="text-red-500 text-sm">{errors.remuneration}</p>
            )}
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium mb-1">Duration</label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className={`w-full border ${
                errors.duration ? "border-red-500" : "border-gray-300"
              } rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500`}
            >
              <option value="">Select duration</option>
              <option value="Full day (up to 8 hours)">
                Full day (up to 8 hours)
              </option>
              <option value="Half day (up to 4 hours)">
                Half day (up to 4 hours)
              </option>
            </select>
            {errors.duration && (
              <p className="text-red-500 text-sm">{errors.duration}</p>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={`w-full border ${
                errors.status ? "border-red-500" : "border-gray-300"
              } rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500`}
            >
              <option value="">Select Status</option>
              <option value="Available">Available</option>
            </select>
            {errors.status && (
              <p className="text-red-500 text-sm">{errors.status}</p>
            )}
          </div>

          {/* Brief Overview */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">
              Brief Overview
            </label>
            <textarea
              value={briefOverview}
              onChange={(e) => setBriefOverview(e.target.value)}
              placeholder="Enter a short overview"
              rows="3"
              className={`w-full border ${
                errors.briefOverview ? "border-red-500" : "border-gray-300"
              } rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500`}
            />
            {errors.briefOverview && (
              <p className="text-red-500 text-sm">{errors.briefOverview}</p>
            )}
          </div>

          {/* Intake Details */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">
              Intake Details
            </label>
            <textarea
              value={intakeDetails}
              onChange={(e) => setIntakeDetails(e.target.value)}
              placeholder="Enter intake details"
              rows="3"
              className={`w-full border ${
                errors.intakeDetails ? "border-red-500" : "border-gray-300"
              } rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500`}
            />
            {errors.intakeDetails && (
              <p className="text-red-500 text-sm">{errors.intakeDetails}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="col-span-1 md:col-span-2 flex justify-end gap-3 mt-4">
            <button
              type="submit"
              className={`px-4 py-2 rounded text-white ${
                isFormValid
                  ? "bg-orange-600 hover:bg-orange-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              Save Job
            </button>
            {/* <button
              type="button"
              onClick={handleExcelUploadClick}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Upload Excel
            </button> */}
            <button
              type="button"
              onClick={handleJobSchedule}
              className="px-4 py-2 border border-gray-300 rounded cursor-pointer hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>

          {/* <div className="w-full max-w-3xl mt-4 flex justify-start">
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
          </div> */}
        </form>
      </div>
    </div>
  );
}

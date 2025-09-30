import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function CreateJob() {
  const baseUrl = process.env.REACT_APP_Base_Url;
  // const baseUrl = "http://localhost:5000/api/users"
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

  // Party modal states
  const [isPartyModalOpen, setIsPartyModalOpen] = useState(false);
  const [partyName, setPartyName] = useState("");
  const [PartyEmail, setPartyEmail] = useState("");
  const [partyPhone, setPartyPhone] = useState("");
  const [parties, setParties] = useState([]); // store all parties added

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
        parties, // include parties in payload
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

  const handleAddParty = (e) => {
    e.preventDefault();
    setIsPartyModalOpen(true);
  };

  // 🔹 Submit party locally
  const handlePartySubmit = () => {
    if (!partyName || !PartyEmail || !partyPhone) {
      toast.error("Please fill all party fields");
      return;
    }

    const newParty = {
      id: Date.now(), // unique ID for local state
      name: partyName,
      email: PartyEmail,
      phone: partyPhone,
    };

    setParties([...parties, newParty]);
    toast.success("Party added successfully!");

    // reset modal fields
    setPartyName("");
    setPartyEmail("");
    setPartyPhone("");
    setIsPartyModalOpen(false);
  };

  // 🔹 Delete party locally
  const handleDeleteParty = (id) => {
    if (!window.confirm("Are you sure you want to delete this party?")) return;
    setParties(parties.filter((p) => p.id !== id));
    toast.success("Party deleted successfully!");
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
              <option value="Conciliation">Conciliation</option>
              <option value="Legal">Legal</option>
              <option value="Other">Other</option>
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

          {/* Party Section */}
          <div className="col-span-1 md:col-span-2 ">
            <h3 className="block text-sm font-medium mb-1">Parties</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {/* Add Party Card */}
              <div
                onClick={handleAddParty}
                className="border-2 border-dashed border-orange-400 rounded-xl flex flex-col items-center justify-center cursor-pointer bg-orange-50 hover:bg-orange-100 transition p-6"
              >
                <span className="text-6xl text-orange-500 font-bold">+</span>
                <p className="text-lg mt-2 text-orange-600 font-bold">
                  Add Party
                </p>
              </div>

              {/* Render Added Parties */}
              {parties.map((p, index) => (
                <div
                  key={p.id}
                  className="border rounded-xl shadow-sm p-4 flex flex-col justify-between bg-orange-50 relative"
                >
                  <div>
                    <p className="font-semibold text-gray-700">{p.name}</p>
                    <p className="text-sm text-gray-500">{p.email}</p>
                    <p className="text-sm text-gray-500">{p.phone}</p>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteParty(p.id)}
                    className="mt-3 px-3 py-1 text-sm bg-red-100 text-red-600 rounded-lg hover:bg-red-200 self-end"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-1 md:col-span-2 flex justify-end gap-3 mt-4">
            <button
              type="submit"
              form="createJobForm"
              disabled={!isFormValid}
              className={`px-6 py-2 rounded-lg text-white shadow ${
                isFormValid
                  ? "bg-orange-600 hover:bg-orange-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              Save Job
            </button>
            <button
              type="button"
              onClick={handleJobSchedule}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
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

      {/* Party Modal */}
      {isPartyModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-[90%] max-w-2xl">
            <h2 className="text-2xl font-bold mb-6 text-gray-700 text-center">
              Add Party Details
            </h2>

            <div className="space-y-5">
              <input
                type="text"
                placeholder="Enter Party Name"
                value={partyName}
                onChange={(e) => setPartyName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <textarea
                placeholder="Enter Party Email"
                value={PartyEmail}
                onChange={(e) => setPartyEmail(e.target.value)}
                rows="3"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
              />
              <input
                type="text"
                placeholder="Enter Contact Number"
                value={partyPhone}
                onChange={(e) => setPartyPhone(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="flex justify-end gap-4 mt-8">
              <button
                onClick={() => setIsPartyModalOpen(false)}
                className="px-6 py-3 border text-gray-700 border-gray-300 rounded-lg hover:bg-gray-100 text-lg"
              >
                Cancel
              </button>
              <button
                onClick={handlePartySubmit}
                className="px-6 py-3 bg-orange-600 text-white rounded-lg text-lg hover:bg-orange-700 shadow-md"
              >
                Add Party
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

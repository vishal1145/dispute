import React, { useState } from "react";
import createjobs from "../Data/createjobs.json";
import { useNavigate } from "react-router-dom";

export default function CreateJobs() {
  const navigate = useNavigate();
  const handleJobSchedule = () => {
    navigate("/");
  };
  const [formData, setFormData] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Data:", formData);
  };

  return (
    <div>
      <div className="min-h-screen flex flex-col items-center px-6">
        {/* Header Section */}
        <div
          className="w-full max-w-full bg-cover bg-center h-[250px] rounded-lg flex items-center justify-center"
          style={{ backgroundImage: "url('/images/job.jpg')" }}
        >
          <div className="flex flex-col gap-5 items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Post a New Job
            </h1>
            <p className="text-sm text-gray-600">
              Add job details for dispute resolution services
            </p>
          </div>
        </div>
        <div className="w-full max-w-3xl mt-5 flex  items-center justify-start">
          <button
            onClick={handleJobSchedule}
            className="flex items-center gap-2 px-4 py-2 text-orange-500 shadow-sm rounded-lg hover:bg-orange-50 transition"
          >
            <img
              src="/icons/left-direction.svg"
              alt="direction"
              className="w-6 h-6"
            />
            <span>Back</span>
          </button>
        </div>

        {/* Form Card */}
        <div className="bg-white mt-6 rounded-xl border border-gray-200 p-6 w-full max-w-3xl">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Job Details</h2>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {createjobs.map((field, index) => (
              <div
                key={index}
                className={field.type === "textarea" ? "md:col-span-2" : ""}
              >
                <label className="block text-xs uppercase tracking-wide font-medium mb-2 text-gray-600">
                  {field.label}
                </label>

                {field.type === "textarea" && (
                  <textarea
                    name={field.name}
                    placeholder={field.placeholder}
                    rows="3"
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                )}

                {field.type === "select" && (
                  <select
                    name={field.name}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select {field.label}</option>
                    {field.options.map((opt, i) => (
                      <option key={i} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                )}

                {field.type !== "textarea" && field.type !== "select" && (
                  <input
                    type={field.type}
                    name={field.name}
                    placeholder={field.placeholder}
                    //   onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                )}
              </div>
            ))}

            {/* Buttons */}
            <div className="col-span-1 md:col-span-2 flex justify-end gap-3 mt-6">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
              >
                Save Job
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

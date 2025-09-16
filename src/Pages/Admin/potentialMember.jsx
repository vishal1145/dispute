import React, { useEffect, useState, useRef } from "react";
import Header from "../../components/header";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import axios from "axios";
import Pagination from "@mui/material/Pagination";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Stack,
} from "@mui/material";

const USERS_PER_PAGE = 10;

export default function PotentialMember() {
  // const baseUrl = "https://dispute-mail.algofolks.com/users/api";
  const baseUrl = "http://localhost:5000/users/api";
  const [users, setUsers] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [excelFile, setExcelFile] = useState(null);
  const fileInputRef = useRef(null);
  const [search, setSearch] = useState("");
  const [fieldFilter, setFieldFilter] = useState("");
  const [selected, setSelected] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const SAMPLE_URL = `${process.env.PUBLIC_URL}/members (1).xlsx`;
  const [formData, setFormData] = useState({
    subject: "",
    body: "",
  });

  const [isOpen, setIsOpen] = useState(false); // modal state
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  // const [loading, setLoading] = useState(false);

  // Open modal
  const openModal = () => setIsOpen(true);
  // Close modal
  const closeModal = () => setIsOpen(false);

  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editRow, setEditRow] = useState(null);

  const fieldOptions = [...new Set(users.map((row) => row.field))];

  const memberData = async () => {
    try {
      setLoading(true);
      const apiResponse = await axios.get(baseUrl);
      const response = apiResponse.data;
      setUsers(response.data || []);
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    memberData();
  }, []);

  const updateUser = async () => {
    try {
      await axios.put(`${baseUrl}/edit/${selectedUserId}`, formData);
      toast.success("Message updated successfully!");
      memberData();
      setFormData({ subject: "", body: "" });
    } catch (error) {
      console.error("Error updating message:", error);
      toast.error("Failed to update message");
    } finally {
      setOpenUpdate(false);
    }
  };

  const handleEditMessage = (u) => {
    setOpenUpdate(true);
    setSelectedUserId(u._id);
    setFormData({
      subject: u.message?.subject || "",
      body: u.message?.body || "",
    });
  };

  const handleExcelUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setExcelFile(file);
    uploadExcel(file);
  };

  const uploadExcel = async (file) => {
    const formData = new FormData();
    formData.append("excel_file", file);
    try {
      setUploading(true);
      await axios.post(`${baseUrl}/excel-upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await memberData();
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setExcelFile(null);
    }
  };

  const filteredData = users.filter((row) => {
    const name = row.name?.toLowerCase() || "";
    const state = row.state?.toLowerCase() || "";
    const field = row.field?.toLowerCase() || "";
    const query = search.toLowerCase();

    const matchesSearch =
      name.includes(query) || state.includes(query) || field.includes(query);

    const matchesField = fieldFilter
      ? row.field.toLowerCase() === fieldFilter.toLowerCase()
      : true;

    return matchesSearch && matchesField;
  });

  const totalPages = Math.ceil(filteredData.length / USERS_PER_PAGE);
  const displayedUsers = filteredData.slice(
    (currentPage - 1) * USERS_PER_PAGE,
    currentPage * USERS_PER_PAGE
  );

  const handlePageChange = (_event, value) => {
    setCurrentPage(value);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [search, fieldFilter]);

  // Toggle individual checkbox
  const toggleSelect = (email) => {
    setSelected((prev) =>
      prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email]
    );
  };

  // Toggle select all on current page
  const toggleSelectAll = (isChecked) => {
    const emailsOnPage = displayedUsers.map((m) => m.email);
    if (isChecked) {
      const newSelected = Array.from(new Set([...selected, ...emailsOnPage]));
      setSelected(newSelected);
    } else {
      setSelected(selected.filter((e) => !emailsOnPage.includes(e)));
    }
  };

  const handleSendSelected = async () => {
    if (selected.length === 0) {
      toast.error("Please select at least one member.");
      return;
    }

    try {
      setSending(true);

      // Only selected members
      const selectedMembers = users.filter((u) => selected.includes(u.email));

      // Send in bulk
      const response = await axios.put(`${baseUrl}/send-email`, {
        data: selectedMembers,
      });

      const result = response.data;

      if (result.results) {
        const successCount = result.results.filter(
          (r) => r.status === "success"
        ).length;
        const failCount = result.results.filter(
          (r) => r.status === "failed"
        ).length;
        toast.success(`Emails sent: ${successCount}, Failed: ${failCount}`);
      } else {
        toast.success("Emails sent successfully!");
      }

      await memberData();
      setSelected([]);
    } catch (error) {
      console.error("Error sending emails:", error);
      toast.error("Failed to send emails.");
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => setOpenUpdate(false);

  // POST new message
  const handlePost = async () => {
    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost:5000/users/api/message-edit",
        {
          subject,
          body,
        }
      );
      toast.success("Message created successfully!");
      closeModal();
    } catch (err) {
      console.error(err);
      toast.error("Failed to create message");
    } finally {
      setLoading(false);
    }
  };

  // PUT update message for all users
  const handlePut = async () => {
    try {
      setLoading(true);
      const res = await axios.put("http://localhost:5000/users/api/body-edit", {
        subject,
        body,
      });
      toast.success("All users’ messages updated successfully!");
      await memberData();
      closeModal();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update messages");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row md:flex-row min-h-screen bg-gray-50">
      <Header />
      <div className="p-4 sm:p-6 flex-1 overflow-x-hidden">
        <Toaster position="top-right" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-600">
              Potential Member
            </h1>
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <a
              href={SAMPLE_URL}
              download="members (1).xlsx"
              className="text-gray-600 underline hover:text-gray-800 transition-colors"
              style={{
                textDecoration: "underline",
                color: "gray",
                border: "none",
              }}
            >
              Download Sample File
            </a>

            <input
              type="text"
              placeholder="Search by Name or State..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 min-w-[200px] sm:w-[250px] p-2 border focus:outline-none focus:ring-2 focus:ring-orange-500 rounded-md"
            />

            <div className="relative w-full sm:w-auto">
              <select
                value={fieldFilter}
                onChange={(e) => setFieldFilter(e.target.value)}
                className="peer border border-gray-300 rounded-md px-3 py-2 text-[16px] font-semibold text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 w-full sm:w-auto appearance-none"
              >
                <option value="">All Field</option>
                {fieldOptions.map((opt, i) => (
                  <option key={i} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <svg
                aria-hidden="true"
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-600"
                viewBox="0 0 20 20"
              >
                <path
                  d="M6 8l4 4 4-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div>
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
              <button
                type="button"
                onClick={handleExcelUploadClick}
                className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-60"
                disabled={uploading}
              >
                {uploading ? "Uploading..." : "Upload Excel"}
              </button>
            </div>
            {/* <div>
              <button
                onClick={openModal}
                type="button"
                className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-60"
              >
                Edit Message
              </button>
            </div> */}
          </div>
        </div>

        {selected.length > 0 && (
          <div className="mb-4">
            <button
              onClick={handleSendSelected}
              className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
              disabled={sending}
            >
              {sending ? "Sending..." : `Send Email (${selected.length})`}
            </button>
          </div>
        )}

        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm border-collapse min-w-[850px]">
            <thead>
              <tr className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-600">
                <th className="px-4 py-3 border-b border-gray-200">
                  <input
                    type="checkbox"
                    checked={
                      displayedUsers.length > 0 &&
                      displayedUsers.every((m) => selected.includes(m.email))
                    }
                    onChange={(e) => toggleSelectAll(e.target.checked)}
                  />
                </th>
                <th className="px-4 py-3 border-b border-gray-200">Name</th>
                <th className="px-4 py-3 border-b border-gray-200">Email</th>
                <th className="px-4 py-3 border-b border-gray-200">State</th>
                <th className="px-4 py-3 border-b border-gray-200">Number</th>
                <th className="px-4 py-3 border-b border-gray-200">Field</th>
                <th className="px-4 py-3 border-b border-gray-200">
                  Licensed By
                </th>
                <th className="px-4 py-3 border-b border-gray-200">
                  License Number
                </th>
                <th className="px-4 py-3 border-b border-gray-200">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-4">
                    <div className="flex justify-center items-center">
                      <div className="w-6 h-6 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
                      <span className="ml-2 text-blue-500">
                        Loading data...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : displayedUsers.length > 0 ? (
                displayedUsers.map((user, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 border-b border-gray-200 text-sm"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.includes(user.email)}
                        onChange={() => toggleSelect(user.email)}
                      />
                    </td>
                    <td className="px-4 py-3 text-gray-700">{user.name}</td>
                    <td className="px-4 py-3 text-gray-700">{user.email}</td>
                    <td className="px-4 py-3 text-gray-700">{user.state}</td>
                    <td className="px-4 py-3 text-gray-700">{user.number}</td>
                    <td className="px-4 py-3 text-gray-700">
                      <p className="inline-flex items-center bg-blue-100 text-blue-700 text-[10px] px-3 py-1 rounded-full font-medium">
                        {user.field}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {user.licensedBy}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {user.licenseNumber}
                    </td>
                    <td className="px-4 py-3">
                      {user.email_sent ? (
                        <span className="bg-green-100 text-green-700 text-sm font-medium px-3 py-1 rounded-full">
                          Sent
                        </span>
                      ) : (
                        <button
                          onClick={() => handleEditMessage(user)}
                          className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-3 py-1 rounded-lg transition-colors"
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-gray-500">
                    No record found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
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

        {openUpdate && (
          <Modal open={openUpdate} onClose={handleClose}>
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: {
                  xs: "90%", // Extra small screens
                  sm: "80%", // Small screens
                  md: 1100, // Medium screens
                  lg: 1200, // Large screens
                  xl: 1200, // Extra large screens
                  // If you have a custom 2xl breakpoint, you can define it here or just use xl as max
                },
                maxHeight: "90vh", // Keep modal within screen height
                bgcolor: "background.paper",
                borderRadius: 2,
                boxShadow: 24,
                p: 4,
                overflowY: "auto", // Allow scroll if content is too large
              }}
            >
              <Typography variant="h6" mb={2} sx={{  fontWeight: 600, color: '#111827'}}>
                Edit Message
              </Typography>
              <TextField
                fullWidth
                className="text-gray-700"
                label="Subject"
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                margin="normal"
              />
              <TextField
                fullWidth
                label="Body"
                className="text-gray-700"
                value={formData.body}
                onChange={(e) =>
                  setFormData({ ...formData, body: e.target.value })
                }
                margin="normal"
                multiline
                rows={15} // Show more lines by default for full content visibility
              />
              <Box mt={2} display="flex" justifyContent="flex-end" gap={1}>
                <Button variant="outlined" onClick={handleClose}>
                  Cancel
                </Button>
                <Button variant="contained" onClick={updateUser}>
                  Save
                </Button>
              </Box>
            </Box>
          </Modal>
        )}

        {/* Modal */}
        {/* {isOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg p-6 w-96 relative">
              <div className="flex items-center justify-between ">
                <div>
                  <h2 className="text-xl font-bold mb-4">Edit Message</h2>
                </div>
                <div onClick={closeModal}>
                  <img src="/icons/close.svg" alt="close" className="w-4 h-4" />
                </div>
              </div>
              <input
                type="text"
                placeholder="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="border p-2 rounded w-full mb-3"
              />

              <textarea
                placeholder="Body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="border p-2 rounded w-full mb-3"
              />

              <div className="flex space-x-2">
                <button
                  onClick={handlePost}
                  className=" w-full px-4 py-2 font-semibold bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-60"
                  disabled={loading}
                >
                  Create Message
                </button>
                <button
                  onClick={handlePut}
                  className= "w-full px-4 py-2 font-semibold bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-60"
                  disabled={loading}
                >
                  Update All Users
                </button>
              </div>
            </div>
          </div>
        )} */}
      </div>
    </div>
  );
}

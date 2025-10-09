import React, { useEffect, useState, useRef } from "react";
import Header from "../../components/header";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import Pagination from "@mui/material/Pagination";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Stack,
} from "@mui/material";

import UpdateEmailModal from "../../components/UpdateEmailModal";
import RowActionsMenu from "../../components/RowActionsMenu";
import http from "../../utils/axios";
const USERS_PER_PAGE = 10;

export default function PotentialMember() {
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
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [openUpdateEmail, setOpenUpdateEmail] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    subject: "",
    body: "",
  });

  const firstName = users?.name?.trim().split(" ")[0] || "";
  const formattedName =
    firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();

  const previewContent = (formData?.body || "").replace(
    "{name}",
    formattedName
  );

  const SAMPLE_URL = `${process.env.PUBLIC_URL}/members (1).xlsx`;

  const handleOpenUpdateEmail = (user) => {
    setSelectedUser(user);
    setOpenUpdateEmail(true);
    setSelectedUserId(user._id);
  };

  const handleSaveEmail = async (newEmail, user) => {
    setSaving(true);
    try {
      // Call API with new email
      await http.put(`/edit/${selectedUserId}`, { email: newEmail });

      toast.success("Email updated successfully!");

      memberData();

      // Reset form (if you want to clear fields)
      setFormData({ email: "" });
    } catch (error) {
      console.error("Error updating email:", error);
      toast.error("Failed to update email");
    } finally {
      setOpenUpdate(false); // close modal
      setSaving(false); // stop loading spinner
    }

    // Debug log
    console.log(`Updated email: ${newEmail} for user: ${user}`);
  };

  const fieldOptions = [
    "Mediation",
    "Conciliation",
    "Arbitration",
    "Negotiation",
    "Facilitation",
    "Litigation",
  ];

  const memberData = async () => {
    try {
      setLoading(true);
      const apiResponse = await http.get("/");
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
      await http.put(`/edit/${selectedUserId}`, formData);
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
      await http.post(`/excel-upload`, formData, {
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
      ? field === fieldFilter.toLowerCase()
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
      const response = await http.put(`/send-email`, {
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

  const handleSendEmail = async (email) => {
    try {
      await http.put(`/send-email`, { email });
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

  return (
    <div className="flex flex-col lg:flex-row md:flex-row min-h-screen bg-gray-50">
      <Header />
      <div className="p-4 sm:p-6 flex-1 overflow-x-hidden">
        <Toaster position="top-right" />

        {/* update email modal */}
        <UpdateEmailModal
          open={openUpdateEmail}
          onClose={() => setOpenUpdateEmail(false)}
          user={selectedUser}
          onSave={handleSaveEmail}
          saving={saving}
        />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">
              Potential Members
            </h1>
            {(search || fieldFilter) && (
              <p className="text-sm text-gray-500 mt-1">
                {filteredData.length} of {users.length} members
                {fieldFilter && ` • ${fieldFilter}`}
                {search && ` • "${search}"`}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <a
              href={SAMPLE_URL}
              download="members (1).xlsx"
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Download Sample File
            </a>

            <input
              type="text"
              placeholder="Search by name or state"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 min-w-[200px]"
            />

            <select
              value={fieldFilter}
              onChange={(e) => setFieldFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 bg-white"
            >
              <option value="">All Fields</option>
              {fieldOptions.map((opt, i) => (
                <option key={i} value={opt}>
                  {opt}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-2">
              <input
                type="file"
                accept=".xlsx,.xls"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
              {excelFile && (
                <span className="text-xs text-gray-500 truncate max-w-[120px]">
                  {excelFile.name}
                </span>
              )}
              <button
                type="button"
                onClick={handleExcelUploadClick}
                className="px-3 py-2 bg-orange-500 text-white text-sm rounded-md hover:bg-orange-600 disabled:opacity-50 transition-colors"
                disabled={uploading}
              >
                {uploading ? "Uploading..." : "Upload Excel"}
              </button>
            </div>
          </div>
        </div>

        {selected.length > 0 && (
          <div className="mb-4">
            <button
              onClick={handleSendSelected}
              className="px-3 py-2 bg-orange-500 text-white text-sm rounded-md hover:bg-orange-600 disabled:opacity-50 transition-colors"
              disabled={sending}
            >
              {sending ? "Sending..." : `Send Email (${selected.length})`}
            </button>
          </div>
        )}

        <div className="overflow-x-auto bg-white rounded-lg">
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="border-b text-left text-gray-500 text-xs font-medium">
                <th className="px-3 py-2">
                  <input
                    type="checkbox"
                    checked={
                      displayedUsers.length > 0 &&
                      displayedUsers.every((m) => selected.includes(m.email))
                    }
                    onChange={(e) => toggleSelectAll(e.target.checked)}
                    className="rounded"
                  />
                </th>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">State</th>
                <th className="px-3 py-2">Phone</th>
                <th className="px-3 py-2">Field</th>
                <th className="px-3 py-2">Licensed By</th>
                <th className="px-3 py-2">License No</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center py-8">
                    <div className="flex justify-center items-center text-gray-400">
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                      <span className="ml-2">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : displayedUsers.length > 0 ? (
                displayedUsers.map((user, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 border-b border-gray-100"
                  >
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={selected.includes(user.email)}
                        onChange={() => toggleSelect(user.email)}
                        className="rounded"
                      />
                    </td>
                    <td
                      className="px-3 py-2 font-medium text-gray-900 truncate max-w-[150px]"
                      title={user.name}
                    >
                      {user.name}
                    </td>
                    <td
                      className="px-3 py-2 text-gray-600 truncate max-w-[200px]"
                      title={user.email}
                    >
                      {user.email}
                    </td>
                    <td
                      className="px-3 py-2 text-gray-600 truncate max-w-[100px]"
                      title={user.state}
                    >
                      {user.state}
                    </td>
                    <td
                      className="px-3 py-2 text-gray-600 truncate max-w-[120px]"
                      title={user.number}
                    >
                      {user.number}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded truncate max-w-[120px] block"
                        title={user.field}
                      >
                        {user.field}
                      </span>
                    </td>
                    <td
                      className="px-3 py-2 text-gray-600 truncate max-w-[150px]"
                      title={user.licensedBy}
                    >
                      {user.licensedBy}
                    </td>
                    <td
                      className="px-3 py-2 text-gray-600 truncate max-w-[120px]"
                      title={user.licenseNumber}
                    >
                      {user.licenseNumber}
                    </td>
                    <td className="px-3 py-2">
                      <RowActionsMenu
                        user={user}
                        onUpdateEmail={handleOpenUpdateEmail}
                        onEditMessage={handleEditMessage}
                        onSendMessage={handleSendEmail}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center py-8 text-gray-400">
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-end mt-4">
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              variant="outlined"
              size="small"
              sx={{
                "& .MuiPaginationItem-root.Mui-selected": {
                  backgroundColor: "#f97316",
                  color: "white",
                  borderColor: "#f97316",
                },
                "& .MuiPaginationItem-root.Mui-selected:hover": {
                  backgroundColor: "#ea580c",
                },
              }}
            />
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
                width: { xs: "90%", sm: "80%", md: 1100, lg: 1200, xl: 1200 },
                maxHeight: "90vh",
                bgcolor: "background.paper",
                borderRadius: 2,
                boxShadow: 24,
                p: 4,
                overflowY: "auto",
              }}
            >
              <Typography
                variant="h6"
                mb={2}
                sx={{ fontWeight: 600, color: "#111827" }}
              >
                Edit Message
              </Typography>

              {/* ✍️ Subject Field */}
              <TextField
                fullWidth
                label="Subject"
                className="text-gray-700"
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                margin="normal"
              />

              {/* 📝 React Quill Editor for body */}
              <ReactQuill
                theme="snow"
                value={formData.body}
                onChange={(value) => setFormData({ ...formData, body: value })}
                style={{
                  height: "400px",
                  marginBottom: "20px",
                }}
              />
              {/* 🚀 Actions */}
              <Box mt={7} display="flex" justifyContent="flex-end" gap={1}>
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
      </div>
    </div>
  );
}

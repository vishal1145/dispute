import React, { useState, useEffect } from "react";
import Header from "../../components/header";
import axios from "axios";
import { FileText, X, Plus } from "lucide-react";
import { Box, CircularProgress, Pagination, Stack } from "@mui/material";

export default function Payments() {
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    memberId: '',
    jobId: '',
    amount: '',
    category: '',
    notes: '',
  });

  const [apiUsers, setApiUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const [apiJobs, setApiJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);

  const [apiPayments, setApiPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [paymentsPerPage] = useState(10);

  const baseUrl = process.env.REACT_APP_Base_Url;

  // Calculate pagination
  const indexOfLastPayment = currentPage * paymentsPerPage;
  const indexOfFirstPayment = indexOfLastPayment - paymentsPerPage;
  const currentPayments = apiPayments.slice(indexOfFirstPayment, indexOfLastPayment);
  const totalPages = Math.ceil(apiPayments.length / paymentsPerPage);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Mediation':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Conciliation':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Arbitration':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Negotiation':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Facilitation':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatCurrency = (amount) => {
    return `$${parseFloat(amount).toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getPaymentMemberName = (payment) => {
    return payment?.memberName || payment?.member_name || payment?.member || payment?.name || 'Unknown User';
  };

  const getPaymentMemberEmail = (payment) => {
    return payment?.memberEmail || payment?.member_email || payment?.email || '';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCreateForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!createForm.memberId || !createForm.jobId || !createForm.amount || !createForm.category) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const paymentData = {
        memberName: apiUsers.find(user => user.id == createForm.memberId)?.displayName || apiUsers.find(user => user.id == createForm.memberId)?.user_nicename || apiUsers.find(user => user.id == createForm.memberId)?.first_name + ' ' + apiUsers.find(user => user.id == createForm.memberId)?.last_name || apiUsers.find(user => user.id == createForm.memberId)?.username || apiUsers.find(user => user.id == createForm.memberId)?.name || 'Unknown User',
        userId: createForm.memberId,
        jobId: createForm.jobId,
        amount: createForm.amount.toString(),
        category: createForm.category,
        jobDescription: apiJobs.find(job => job.id == createForm.jobId)?.briefOverview || 'N/A',
        notes: createForm.notes || '',
        transactionDate: new Date().toISOString().split('T')[0]
      };

      const response = await axios.post(`${baseUrl}/payments`, paymentData);
      console.log('Payment created successfully:', response.data);

      setShowCreateModal(false);
      setCreateForm({
        memberId: '',
        jobId: '',
        amount: '',
        category: '',
        notes: '',
      });
      
      await getPayments();
      alert('Payment created successfully!');
    } catch (error) {
      console.error('Error creating payment:', error);
      alert('Failed to create payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getUsers = async () => {
    try {
      setUsersLoading(true);
      const { data } = await axios.get(`${baseUrl}/users`);
      setApiUsers(data?.users || data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  const getCompletedJobs = async () => {
    try {
      setJobsLoading(true);
      const { data } = await axios.get(`${baseUrl}/jobs/completed/user/14`);
      setApiJobs(data?.jobs || data || []);
    } catch (err) {
      console.error('Error fetching completed jobs:', err);
    } finally {
      setJobsLoading(false);
    }
  };

  const getPayments = async () => {
    try {
      setPaymentsLoading(true);
      const { data } = await axios.get(`${baseUrl}/payments`);
      setApiPayments(data?.payments || data || []);
    } catch (err) {
      console.error('Error fetching payments:', err);
    } finally {
      setPaymentsLoading(false);
    }
  };

  useEffect(() => {
    if (apiUsers.length === 0) {
      getUsers();
    }
    if (apiJobs.length === 0) {
      getCompletedJobs();
    }
    if (apiPayments.length === 0) {
      getPayments();
    }
  }, [apiUsers.length, apiJobs.length, apiPayments.length]);

  const handleJobChange = (jobId) => {
    const selectedJob = apiJobs.find(job => job.id == jobId);
    setCreateForm(prev => ({
      ...prev,
      jobId: jobId,
      category: selectedJob?.resolutionField || ''
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col md:flex-row">
        <Header />

        <div className="flex-1 p-4 sm:p-6 md:p-8 bg-gray-50 overflow-y-auto">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-600">Payments Management</h1>
              <p className="text-gray-600 mt-2">Track and manage all payment transactions for dispute resolution jobs.</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Payment
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-300">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs uppercase tracking-wide text-gray-600 font-semibold">
                      Member
                    </th>
                    <th className="px-6 py-4 text-left text-xs uppercase tracking-wide text-gray-600 font-semibold">
                      Job Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs uppercase tracking-wide text-gray-600 font-semibold">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-xs uppercase tracking-wide text-gray-600 font-semibold">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs uppercase tracking-wide text-gray-600 font-semibold">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paymentsLoading ? (
                    <tr>
                      <td colSpan="5" className="text-center py-20">
                        <Box sx={{ display: "flex", justifyContent: "center" }}>
                          <CircularProgress />
                        </Box>
                      </td>
                    </tr>
                  ) : currentPayments.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-12">
                        <FileText className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No payments found</h3>
                        <p className="mt-1 text-sm text-gray-500">Get started by creating a new payment transaction.</p>
                      </td>
                    </tr>
                  ) : (
                    currentPayments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-base font-medium text-gray-900 mb-1">
                              {getPaymentMemberName(payment)}
                            </div>
                            <div className="text-sm text-gray-600">
                              {getPaymentMemberEmail(payment)}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-base font-medium text-gray-900 mb-1">
                              {payment.jobDescription}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${getCategoryColor(payment.category)}`}>
                            {payment.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-900 font-medium">
                          {formatDate(payment.transactionDate)}
                        </td>
                        <td className="px-6 py-4 text-gray-900 font-medium">
                          {formatCurrency(payment.amount)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {!paymentsLoading && apiPayments.length > 0 && (
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
          )}
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Create New Payment</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Member *
                </label>
                <select
                  value={createForm.memberId}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, memberId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">
                    {usersLoading ? 'Loading members...' : 'Choose a member...'}
                  </option>
                  {apiUsers.length > 0 ? apiUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.displayName || user.user_nicename || user.first_name + ' ' + user.last_name || user.username || user.name || 'Unknown User'}
                    </option>
                  )) : !usersLoading && (
                    <option value="" disabled>No members available</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Job *
                </label>
                <select
                  name="jobId"
                  value={createForm.jobId}
                  onChange={(e) => handleJobChange(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">
                    {jobsLoading ? "Loading jobs..." : "Choose a job..."}
                  </option>
                  {apiJobs.length > 0
                    ? apiJobs.map((job) => (
                        <option key={job.id} value={job.id}>
                          {job.briefOverview}
                        </option>
                      ))
                    : !jobsLoading && <option value="" disabled>No jobs available</option>}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <input
                  type="text"
                  name="category"
                  value={createForm.category}
                  readOnly
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-600"
                  placeholder="Auto-filled from selected job"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                  <input
                    type="number"
                    name="amount"
                    value={createForm.amount}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full border border-gray-300 rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

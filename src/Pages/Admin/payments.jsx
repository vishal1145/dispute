import React, { useState, useEffect, useRef } from "react";
import Header from "../../components/header";
import axios from "axios";
import { FileText, X, Plus, ChevronDown, Search } from "lucide-react";
import { Box, CircularProgress, Pagination, Stack } from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

  // Custom dropdown states
  const [memberDropdownOpen, setMemberDropdownOpen] = useState(false);
  const [jobDropdownOpen, setJobDropdownOpen] = useState(false);
  const [memberSearchTerm, setMemberSearchTerm] = useState('');
  const [jobSearchTerm, setJobSearchTerm] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [paymentsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPayments, setTotalPayments] = useState(0);

  const baseUrl = process.env.REACT_APP_Base_Url;
  
  // Refs for dropdowns
  const memberDropdownRef = useRef(null);
  const jobDropdownRef = useRef(null);

  // Server-side pagination - no need for client-side calculations

  const handlePageChange = (event, value) => {
    getPayments(value);
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
    setCreateForm(prev => {
      const newForm = {
        ...prev,
        [name]: value
      };
      return newForm;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!createForm.memberId || !createForm.jobId || !createForm.amount || !createForm.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      
      const paymentData = {
        memberName: getSelectedMemberName(),
        userId: createForm.memberId,
        jobId: createForm.jobId,
        amount: createForm.amount.toString(),
        category: createForm.category,
        jobDescription: getSelectedJobDescription(),
        notes: createForm.notes || '',
        transactionDate: new Date().toISOString().split('T')[0]
      };
      

      const response = await axios.post(`${baseUrl}/payments`, paymentData);

      setShowCreateModal(false);
      setCreateForm({
        memberId: '',
        jobId: '',
        amount: '',
        category: '',
        notes: '',
      });

      await getPayments(currentPage);
      toast.success('Payment created successfully!');
    } catch (error) {
      toast.error('Failed to create payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getUsers = async () => {
    try {
      setUsersLoading(true);
      const { data } = await axios.get(`${baseUrl}/users`);
      setApiUsers(data?.users || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setApiUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  const getCompletedJobs = async (userId) => {
    try {
      const { data } = await axios.get(`${baseUrl}/jobs/completed/user/${userId}`);
      setApiJobs(data?.jobs || []);
    } catch (err) {
      console.error('Error fetching completed jobs:', err);
      setApiJobs([]);
    }
  };

  const getPayments = async (page = 1) => {
    try {
      setPaymentsLoading(true);
      const { data } = await axios.get(`${baseUrl}/payments?page=${page}&per_page=${paymentsPerPage}`);
      
      setApiPayments(data?.payments || []);
      setTotalPages(data?.total_pages || 1);
      setTotalPayments(data?.total || 0);
      setCurrentPage(page);
      
    } catch (err) {
      console.error('Error fetching payments:', err);
      setApiPayments([]);
      setTotalPages(1);
      setTotalPayments(0);
    } finally {
      setPaymentsLoading(false);
    }
  };

  useEffect(() => {
    if (apiUsers.length === 0) {
      getUsers();
    }
  
    if (apiPayments.length === 0) {
      getPayments(1);
    }
  }, [apiUsers.length, apiJobs.length, apiPayments.length]);

  // Handle clicks outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (memberDropdownRef.current && !memberDropdownRef.current.contains(event.target)) {
        setMemberDropdownOpen(false);
      }
      if (jobDropdownRef.current && !jobDropdownRef.current.contains(event.target)) {
        setJobDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Debug logging
  useEffect(() => {
  }, [createForm, apiUsers, apiJobs, apiPayments, totalPages, totalPayments]);

  const handleJobChange = (jobId) => {
    const selectedJob = apiJobs.find(job => job.id == jobId);
    setCreateForm(prev => ({
      ...prev,
      jobId: jobId,
      category: selectedJob?.resolutionField || '',
      amount: selectedJob?.remuneration || ''
    }));
    setJobDropdownOpen(false);
    setJobSearchTerm('');
  };

  const handleMemberSelect = (memberId) => {
    setCreateForm(prev => ({
      ...prev,
      memberId: memberId
    }));
    setMemberDropdownOpen(false);
    setMemberSearchTerm('');
    if (memberId) {
      getCompletedJobs(memberId);
    } else {
      setApiJobs([]);
    }
  };

  const filteredMembers = apiUsers.filter(user => 
    user.firstName?.toLowerCase().includes(memberSearchTerm.toLowerCase()) ||
    user.lastName?.toLowerCase().includes(memberSearchTerm.toLowerCase())
  );

  const filteredJobs = apiJobs.filter(job => 
    job.briefOverview?.toLowerCase().includes(jobSearchTerm.toLowerCase())
  );

  const getSelectedMemberName = () => {
    if (!createForm.memberId) return '';
    const user = apiUsers.find(u => u.id == createForm.memberId);
    return user ? `${user.firstName} ${user.lastName}` : '';
  };

  const getSelectedJobDescription = () => {
    if (!createForm.jobId) return '';
    const job = apiJobs.find(j => j.id == createForm.jobId);
    return job ? job.briefOverview : '';
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
              className="inline-flex items-center px-4 py-2 bg-[#f97316] text-white font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Payment
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Pagination Info */}
            
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
                  ) : apiPayments.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-12">
                        <FileText className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No payments found</h3>
                        <p className="mt-1 text-sm text-gray-500">Get started by creating a new payment transaction.</p>
                      </td>
                    </tr>
                  ) : (
                    apiPayments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50 border-b border-gray-200 text-sm">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-base font-medium  text-gray-900 mb-1">
                              {getPaymentMemberName(payment)}
                            </div>
                            <div className="text-sm text-gray-600">
                              {getPaymentMemberEmail(payment)}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-base align-top text-gray-700">
                              {payment.jobDescription}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-3 py-1 text-[12px] font-medium rounded-full border ${getCategoryColor(payment.category)}`}>
                            {payment.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 align-top text-gray-700">
                          {formatDate(payment.transactionDate)}
                        </td>
                        <td className="px-6 py-4 align-top text-gray-700">
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
                <div className="relative" ref={memberDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setMemberDropdownOpen(!memberDropdownOpen)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between"
                  >
                    <span className={createForm.memberId ? 'text-gray-900' : 'text-gray-500'}>
                      {getSelectedMemberName() || 'Select a member...'}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${memberDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {memberDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden">
                      <div className="p-2 border-b border-gray-200">
                        <div className="relative">
                          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search members..."
                            value={memberSearchTerm}
                            onChange={(e) => setMemberSearchTerm(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            autoFocus
                          />
                        </div>
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        {filteredMembers.length > 0 ? (
                          filteredMembers.map((user) => (
                            <button
                              key={user.id}
                              type="button"
                              onClick={() => handleMemberSelect(user.id)}
                              className="w-full px-3 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none text-sm"
                            >
                              {user.firstName} {user.lastName}
                            </button>
                          ))
                        ) : (
                          <div className="px-3 py-2 text-sm text-gray-500">No members found</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Job *
                </label>
                <div className="relative" ref={jobDropdownRef}>
                  <button
                    type="button"
                    onClick={() => !createForm.memberId || jobsLoading ? null : setJobDropdownOpen(!jobDropdownOpen)}
                    disabled={!createForm.memberId || jobsLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <span className={createForm.jobId ? 'text-gray-900' : 'text-gray-500'}>
                      {getSelectedJobDescription() || 
                        (!createForm.memberId ? 'Please select a member first' : 
                         jobsLoading ? 'Loading jobs...' : 'Select a job')}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${jobDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {jobDropdownOpen && createForm.memberId && !jobsLoading && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden">
                      <div className="p-2 border-b border-gray-200">
                        <div className="relative">
                          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search jobs..."
                            value={jobSearchTerm}
                            onChange={(e) => setJobSearchTerm(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            autoFocus
                          />
                        </div>
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        {filteredJobs.length > 0 ? (
                          filteredJobs.map((job) => (
                            <button
                              key={job.id}
                              type="button"
                              onClick={() => handleJobChange(job.id)}
                              className="w-full px-3 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none text-sm"
                            >
                              {job.briefOverview}
                            </button>
                          ))
                        ) : (
                          <div className="px-3 py-2 text-sm text-gray-500">No jobs found</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="hidden">
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
                  className="flex-1 px-4 py-2  text-white font-medium rounded-lg bg-[#f97316] transition-colors disabled:bg-[#f97316] disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}

import React, { useState, useEffect } from "react";
import Header from "../../components/header";
import axios from "axios";
import { DollarSign, Calendar, FileText, Users, X, Plus } from "lucide-react";

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    memberId: '',
    jobId: '',
    amount: '',
    category: '',
    notes: '',
  });
  const [stats, setStats] = useState({
    totalPayments: 0,
    totalAmount: 0,
    thisMonthPayments: 0,
    thisMonthAmount: 0
  });

  const [apiUsers, setApiUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const [apiJobs, setApiJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);

  const [apiPayments, setApiPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);

  const baseUrl = process.env.REACT_APP_Base_Url;
  
  // Sample data for dropdowns - replace with actual API calls
  const sampleMembers = [
    { id: 1, name: "John Smith", email: "john.smith@email.com", expertise: "Mediation" },
    { id: 2, name: "Sarah Johnson", email: "sarah.johnson@email.com", expertise: "Conciliation" },
    { id: 3, name: "Michael Brown", email: "michael.brown@email.com", expertise: "Arbitration" },
    { id: 4, name: "Emily Davis", email: "emily.davis@email.com", expertise: "Negotiation" },
    { id: 5, name: "David Wilson", email: "david.wilson@email.com", expertise: "Facilitation" }
  ];

  const sampleJobs = [
    { id: 1, jobNumber: "JOB-001", jobName: "Building Contract Dispute", category: "Mediation", status: "Completed" },
    { id: 2, jobNumber: "JOB-002", jobName: "Employment Contract Issue", category: "Conciliation", status: "Completed" },
    { id: 3, jobNumber: "JOB-003", jobName: "Commercial Lease Dispute", category: "Arbitration", status: "Completed" },
    { id: 4, jobNumber: "JOB-004", jobName: "Family Business Conflict", category: "Negotiation", status: "Completed" },
    { id: 5, jobNumber: "JOB-005", jobName: "Construction Delay Issue", category: "Facilitation", status: "Completed" }
  ];

  // Sample payment data - replace with actual API call
  const samplePayments = [
    {
      id: 1,
      jobNumber: "JOB-001",
      jobName: "Building Contract Dispute",
      category: "Mediation",
      date: "2025-01-15",
      amount: 1200.00,
      memberName: "John Smith",
      memberEmail: "john.smith@email.com",
      status: "Paid"
    },
    {
      id: 2,
      jobNumber: "JOB-002",
      jobName: "Employment Contract Issue",
      category: "Conciliation",
      date: "2025-01-14",
      amount: 950.00,
      memberName: "Sarah Johnson",
      memberEmail: "sarah.johnson@email.com",
      status: "Paid"
    },
    {
      id: 3,
      jobNumber: "JOB-003",
      jobName: "Commercial Lease Dispute",
      category: "Arbitration",
      date: "2025-01-13",
      amount: 1800.00,
      memberName: "Michael Brown",
      memberEmail: "michael.brown@email.com",
      status: "Pending"
    },
    {
      id: 4,
      jobNumber: "JOB-004",
      jobName: "Family Business Conflict",
      category: "Negotiation",
      date: "2025-01-12",
      amount: 1100.00,
      memberName: "Emily Davis",
      memberEmail: "emily.davis@email.com",
      status: "Paid"
    },
    {
      id: 5,
      jobNumber: "JOB-005",
      jobName: "Construction Delay Issue",
      category: "Facilitation",
      date: "2025-01-11",
      amount: 1350.00,
      memberName: "David Wilson",
      memberEmail: "david.wilson@email.com",
      status: "Paid"
    }
  ];

  useEffect(() => {
    // For now, use sample data
    
    // Calculate stats from sample data
    const totalAmount = apiPayments.reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0);
    const thisMonthPayments = apiPayments.filter(payment => {
      const paymentDate = new Date(payment.transactionDate);
      const now = new Date();
      return paymentDate.getMonth() === now.getMonth() && paymentDate.getFullYear() === now.getFullYear();
    });
    const thisMonthAmount = thisMonthPayments.reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0);
    
    setStats({
      totalPayments: apiPayments.length,
      totalAmount: totalAmount,
      thisMonthPayments: thisMonthPayments.length,
      thisMonthAmount: thisMonthAmount
    });
  }, [apiPayments]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
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

  // Derive a readable member name from users or payment fields
  const getUserDisplayName = (user) => {
    if (!user) return 'Unknown User';
    const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ').trim();
    return (
      user.display_name ||
      fullName ||
      user.user_nicename ||
      user.username ||
      user.name ||
      user.user_login ||
      user.user_email ||
      'Unknown User'
    );
  };

  const getPaymentMemberName = (payment) => {
    // Try direct fields from payments API first
    const direct = payment?.memberName || payment?.member_name || payment?.member || payment?.name;
    if (direct) return direct;

    // Try to resolve via user id from payments row
    const candidateId = payment?.userId || payment?.memberId || payment?.user_id || payment?.member_id;
    if (candidateId && Array.isArray(apiUsers)) {
      const user = apiUsers.find(u => String(u.id) === String(candidateId));
      if (user) return getUserDisplayName(user);
    }
    return 'Unknown User';
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

  const createPayment = async () => {
    setLoading(true);
    
    // Create new payment using local data
    const newPayment = {
      id: Date.now(),
      jobNumber: sampleJobs.find(job => job.id == createForm.jobId)?.jobNumber || 'N/A',
      jobName: sampleJobs.find(job => job.id == createForm.jobId)?.jobName || 'N/A',
      category: createForm.category,
      date: new Date().toISOString().split('T')[0],
      amount: parseFloat(createForm.amount),
      memberName: sampleMembers.find(member => member.id == createForm.memberId)?.name || 'N/A',
      memberEmail: sampleMembers.find(member => member.id == createForm.memberId)?.email || 'N/A',
      status: 'Paid'
    };
    
    setPayments(prev => [newPayment, ...prev]);
    
    // Update stats
    setStats(prev => ({
      ...prev,
      totalPayments: prev.totalPayments + 1,
      totalAmount: prev.totalAmount + parseFloat(createForm.amount)
    }));
    
    // Close modal and reset form
    setShowCreateModal(false);
    setCreateForm({
      jobId: '',
      memberId: '',
      amount: '',
      category: '',
      notes: ''
    });
    
    setLoading(false);
    alert('Payment created successfully!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!createForm.memberId || !createForm.jobId || !createForm.amount || !createForm.category) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      // Create payment via API
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
      console.log('Payment payload sent:', paymentData);

      // Add new payment to local state
      const newPayment = {
        id: response.data.id || Date.now(),
        memberId: createForm.memberId,
        jobId: createForm.jobId,
        category: createForm.category,
        date: new Date().toISOString().split('T')[0],
        amount: parseFloat(createForm.amount),
        memberName: apiUsers.find(user => user.id == createForm.memberId)?.displayName || apiUsers.find(user => user.id == createForm.memberId)?.user_nicename || apiUsers.find(user => user.id == createForm.memberId)?.first_name + ' ' + apiUsers.find(user => user.id == createForm.memberId)?.last_name || apiUsers.find(user => user.id == createForm.memberId)?.username || apiUsers.find(user => user.id == createForm.memberId)?.name || 'Unknown User' ,
        memberEmail: apiUsers.find(user => user.id == createForm.memberId)?.user_email || 'N/A',
        jobNumber: apiJobs.find(job => job.id == createForm.jobId)?.id || 'N/A',
        jobName: apiJobs.find(job => job.id == createForm.jobId)?.briefOverview || 'N/A'
      };

      setPayments(prev => [newPayment, ...prev]);
      setShowCreateModal(false);
      setCreateForm({
        memberId: '',
        jobId: '',
        amount: '',
        category: '',
        notes: '',
      });
      
      // Refresh payments list from API
      await getPayments();
      
      // Update stats
      setStats(prev => ({
        ...prev,
        totalPayments: prev.totalPayments + 1,
        totalAmount: prev.totalAmount + newPayment.amount,
        thisMonthPayments: prev.thisMonthPayments + 1,
        thisMonthAmount: prev.thisMonthAmount + newPayment.amount
      }));

      alert('Payment created successfully!');
    } catch (error) {
      console.error('Error creating payment:', error);
      if (error.response) {
        console.error('API Error Response:', error.response.data);
        console.error('API Error Status:', error.response.status);
        console.error('API Error Headers:', error.response.headers);
      }
      alert('Failed to create payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getUsers = async () => {
    try {
      setUsersLoading(true);
      const { data } = await axios.get(`${baseUrl}/users`);
      console.log('Users API Response:', data);
      console.log('Users API Response type:', typeof data);
      console.log('Users API Response keys:', Object.keys(data || {}));
      console.log('First user object:', data?.users?.[0] || data?.[0]);
      if (data?.users?.[0] || data?.[0]) {
        console.log('Available fields:', Object.keys(data?.users?.[0] || data?.[0]));
        console.log('First user full object:', JSON.stringify(data?.users?.[0] || data?.[0], null, 2));
      }
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
      console.log('Completed Jobs API Response:', data);
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
      console.log('Payments API Response:', data);
      setApiPayments(data?.payments || data || []);
    } catch (err) {
      console.error('Error fetching payments:', err);
    } finally {
      setPaymentsLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch data if not already loaded
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

  // Cleanup function to prevent memory leaks
  useEffect(() => {
    return () => {
      // Cleanup when component unmounts
      setApiUsers([]);
      setApiJobs([]);
      setApiPayments([]);
    };
  }, []);

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
        {/* Sidebar */}
        <Header />

        {/* Main Content */}
        <div className="flex-1 p-4 sm:p-6 md:p-8 bg-gray-50 overflow-y-auto">
          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-600">Payments Management</h1>
              <p className="text-[16px] font-medium text-gray-700 mt-2">Track and manage all payment transactions for dispute resolution jobs.</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex  items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
            >
            <Plus className="w-4 h-4 mr-2" />
              Create Payment
            </button>
          </div>


          {/* Payments Table */}
          <div className=" overflow-hidden">
            
            {paymentsLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-600">
                      <th className="px-4 py-3 border-b border-gray-200">
                        Member
                      </th>
                      <th className="px-4 py-3 border-b border-gray-200">
                        Job Details
                      </th>
                      <th className="px-4 py-3 border-b border-gray-200">
                        Category
                      </th>
                      <th className="px-4 py-3 border-b border-gray-200">
                        Date
                      </th>
                      <th className="px-4 py-3 border-b border-gray-200">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {apiPayments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50 border-b border-gray-200 text-sm">
                        <td className="px-4 py-3 align-top">
                          <div>
                            <div className="text-base font-medium text-gray-900 mb-1">
                              {getPaymentMemberName(payment)}
                            </div>
                            <div className="text-sm text-gray-600">
                              {getPaymentMemberEmail(payment)}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <div>
                            <div className="text-base font-medium text-gray-900 mb-1">
                              {payment.jobDescription}
                            </div>
                            {/* <div className="text-sm text-gray-600">
                              Job ID: {payment.jobId}
                            </div> */}
                          </div>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${getCategoryColor(payment.category)}`}>
                            {payment.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 align-top text-gray-900 font-medium">
                          {formatDate(payment.transactionDate)}
                        </td>
                        <td className="px-4 py-3 align-top text-gray-900 font-medium">
                          {formatCurrency(payment.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!paymentsLoading && apiPayments.length === 0 && (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No payments found</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new payment transaction.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Payment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
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

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
              {/* Member Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Member *
                </label>
                <div className="relative">
              <div className="relative group">
  <select
    value={createForm.memberId}
    onChange={(e) => setCreateForm(prev => ({ ...prev, memberId: e.target.value }))}
    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md bg-white
               focus:outline-none focus:ring-2 focus:ring-blue-500
               appearance-none"
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

  {/* custom thick dropdown icon */}
  <svg
    aria-hidden="true"
    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5
               text-gray-600  transition-colors"
    viewBox="0 0 20 20"
  >
    <path
      d="M6 8l4 4 4-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"        /* thickness */
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
</div>

                  
                </div>
              </div>

              {/* Job Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Job *
                </label>
              <div className="relative group">
  <select
    name="jobId"
    value={createForm.jobId}
    onChange={(e) => handleJobChange(e.target.value)}
    required
    className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 bg-white
               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
               appearance-none"
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

  {/* thick manual dropdown icon */}
  <svg
    aria-hidden="true"
    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5
               text-gray-600 transition-colors"
    viewBox="0 0 20 20"
  >
    <path
      d="M6 8l4 4 4-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"          /* thicker line */
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
</div>

                
                {/* Show selected job description from API */}
              </div>

              {/* Category (Auto-filled from job) */}
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

              {/* Amount */}
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

              {/* Notes */}
              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={createForm.notes}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Additional payment notes..."
                />
              </div> */}

              {/* Form Actions */}
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
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="mr-2">Creating...</div>
                    </div>
                  ) : (
                    'Create Payment'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

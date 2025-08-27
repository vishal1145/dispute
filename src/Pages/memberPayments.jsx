import React, { useState, useEffect } from "react";
import Navbar from "../components/navbar";
import axios from "axios";
import { FileText } from "lucide-react";
import { Box, CircularProgress, Pagination, Stack } from "@mui/material";

export default function MemberPayments() {
  const [stats, setStats] = useState({
    totalPayments: 0,
    totalAmount: 0,
    thisMonthPayments: 0,
    thisMonthAmount: 0
  });

  const [apiPayments, setApiPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
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

  useEffect(() => {
    // For now, use sample data
    
    // Calculate stats from sample data
    const totalAmount = apiPayments.reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0);
    const thisMonthPayments = apiPayments.filter(payment => {
      const paymentDate = new Date(payment.payment_date);
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

  const getMemberPayments = async () => {
    try {
      setPaymentsLoading(true);
      const { data } = await axios.get(`${baseUrl}/payments/user/124`);
      console.log('Member Payments API Response:', data);
      setApiPayments(data?.payments || data || []);
    } catch (err) {
      console.error('Error fetching member payments:', err);
    } finally {
      setPaymentsLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch data if not already loaded
    if (apiPayments.length === 0) {
      getMemberPayments();
    }
  }, [apiPayments.length]);

  // Cleanup function to prevent memory leaks
  useEffect(() => {
    return () => {
      // Cleanup when component unmounts
      setApiPayments([]);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col lg:flex-row h-screen">
        <Navbar />

        {/* Main Content */}
        <div className="p-6 flex-1 overflow-y-auto bg-gray-50">
          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold mb-1 text-gray-600">My Payments</h1>
              <p className="text-gray-600">Track and manage your payment transactions for dispute resolution jobs.</p>
            </div>
            <div className="flex gap-3">
             
              
            </div>
          </div>

          {/* Stats Cards */}
       

          {/* Payments Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-300">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs uppercase tracking-wide text-gray-600 font-semibold">
                      Job Details
                    </th>
                    <th className="px-4 py-3 text-left text-xs uppercase tracking-wide text-gray-600 font-semibold">
                      Category
                    </th>
                    <th className="px-4 py-3 text-left text-xs uppercase tracking-wide text-gray-600 font-semibold">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs uppercase tracking-wide text-gray-600 font-semibold">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paymentsLoading ? (
                    <tr>
                      <td colSpan="4" className="text-center py-20">
                        <Box sx={{ display: "flex", justifyContent: "center" }}>
                          <CircularProgress />
                        </Box>
                      </td>
                    </tr>
                  ) : currentPayments.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-12">
                        <FileText className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No payments found</h3>
                        <p className="mt-1 text-sm text-gray-500">Get started by creating a new payment transaction.</p>
                      </td>
                    </tr>
                  ) : (
                    currentPayments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div>
                            <div className="text-gray-900 font-medium text-sm">
                              {payment.jobDescription}
                            </div>
                            {/* <div className="text-sm text-gray-600">
                              {formatDate(payment.transactionDate)}
                            </div> */}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${getCategoryColor(payment.category)}`}>
                            {payment.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {formatDate(payment.transactionDate)}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                          {formatCurrency(payment.amount)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination - Outside Table with Orange Background */}
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
    </div>
  );
}

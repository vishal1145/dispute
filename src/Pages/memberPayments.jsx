import React, { useState, useEffect } from "react";
import Navbar from "../components/navbar";
import axios from "axios";
import { FileText } from "lucide-react";

export default function MemberPayments() {
  const [stats, setStats] = useState({
    totalPayments: 0,
    totalAmount: 0,
    thisMonthPayments: 0,
    thisMonthAmount: 0
  });

  const [apiPayments, setApiPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);

  const baseUrl = process.env.REACT_APP_Base_Url;

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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Payments</h1>
              <p className="text-gray-600">Track and manage your payment transactions for dispute resolution jobs.</p>
            </div>
            <div className="flex gap-3">
             
              
            </div>
          </div>

          {/* Stats Cards */}
       

          {/* Payments Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            
            {paymentsLoading ? (
             <div className="flex justify-center items-center h-64">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-300">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs uppercase tracking-wide text-gray-600">
                        Job Details
                      </th>
                      <th className="px-6 py-4 text-left text-xs uppercase tracking-wide text-gray-600">
                        Category
                      </th>
                      <th className="px-6 py-4 text-left text-xs uppercase tracking-wide text-gray-600">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs uppercase tracking-wide text-gray-600">
                        Amount
                      </th>
                      {/* <th className="px-6 py-4 text-left text-base font-medium text-gray-800 uppercase tracking-wider">
                        Status
                      </th> */}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {apiPayments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-base font-medium text-gray-900 mb-1">
                              {payment.jobDescription}
                            </div>
                            <div className="text-sm text-gray-600">
                              Job ID: {payment.jobId}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${getCategoryColor(payment.category)}`}>
                            {payment.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-base text-gray-900">
                          {formatDate(payment.payment_date)}
                        </td>
                        <td className="px-6 py-4 text-base font-semibold text-gray-900">
                          {formatCurrency(payment.amount)}
                        </td>
                        {/* <td className="px-6 py-4">
                          <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(payment.status)}`}>
                            {payment.status}
                          </span>
                        </td> */}
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
    </div>
  );
}

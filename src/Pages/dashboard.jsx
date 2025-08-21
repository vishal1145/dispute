import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/navbar";
import dashboardData from "../Data/dashboardData.json";
import { 
  FileText,
  CheckCircle,
  Clock,
  Users,
  Calendar,
  DollarSign
} from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(dashboardData.dashboardStats);
  const [recentActivity, setRecentActivity] = useState(dashboardData.recentActivity);

  const formatCurrency = (amount) => {
    return `$${parseInt(amount).toLocaleString()}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'booked':
        return 'bg-blue-100 text-blue-700 border-green-200';
      case 'available':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'booked':
        return <Clock className="w-4 h-4" />;
      case 'available':
        return <FileText className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const StatCard = ({ title, value, icon, bgColor, iconColor }) => {
    const getBgColor = (colorClass) => {
      switch (colorClass) {
        case 'bg-emerald-50': return '#ecfdf5';
        case 'bg-sky-50': return '#f0f9ff';
        case 'bg-violet-50': return '#faf5ff';
        case 'bg-amber-50': return '#fffbeb';
        default: return '#ffffff';
      }
    };

    const getIconColor = (colorClass) => {
      switch (colorClass) {
        case 'text-emerald-600': return '#059669';
        case 'text-sky-600': return '#0284c7';
        case 'text-violet-600': return '#9333ea';
        case 'text-amber-600': return '#d97706';
        default: return '#374151';
      }
    };

    return (
      <div 
        className="rounded-xl p-6 shadow-sm border border-gray-200"
        style={{ backgroundColor: getBgColor(bgColor) }}
      >
        <div className="flex flex-col">
          <div className="text-2xl mb-3" style={{ color: getIconColor(iconColor) }}>
            {icon}
          </div>
          <div className="flex-1">
            <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
            <p className="text-sm font-medium text-gray-700">{title}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen">
      <Navbar />
      
      <div className="p-6 flex-1 overflow-y-auto bg-gray-50">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Member Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's your dispute resolution activity overview.</p>
        </div>

        {/* Stats Grid */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Admin Stat Cards */}
            <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-200 shadow-sm">
              <div className="flex flex-col">
                <div className="text-2xl text-emerald-600 mb-3">
                  <Users className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="text-3xl font-bold text-gray-900 mb-2">24</p>
                  <p className="text-sm font-medium text-gray-700">Available Jobs</p>
                </div>
              </div>
            </div>

            <div className="bg-sky-50 rounded-xl p-6 border border-sky-200 shadow-sm">
              <div className="flex flex-col">
                <div className="text-2xl text-sky-600 mb-3">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="text-3xl font-bold text-gray-900 mb-2">156</p>
                  <p className="text-sm font-medium text-gray-700">Total Jobs Done</p>
                </div>
              </div>
            </div>

            <div className="bg-violet-50 rounded-xl p-6 border border-violet-200 shadow-sm">
              <div className="flex flex-col">
                <div className="text-2xl text-violet-600 mb-3">
                  <Calendar className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="text-3xl font-bold text-gray-900 mb-2">18</p>
                  <p className="text-sm font-medium text-gray-700">Past Month Jobs</p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 rounded-xl p-6 border border-amber-200 shadow-sm">
              <div className="flex flex-col">
                <div className="text-2xl text-amber-600 mb-3">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="text-3xl font-bold text-gray-900 mb-2">$45,600</p>
                  <p className="text-sm font-medium text-gray-700">Total Earnings</p>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 rounded-xl p-6 border border-orange-200 shadow-sm">
              <div className="flex flex-col">
                <div className="text-2xl text-orange-600 mb-3">
                  <Clock className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="text-3xl font-bold text-gray-900 mb-2">8</p>
                  <p className="text-sm font-medium text-gray-700">Upcoming Booked</p>
                </div>
              </div>
            </div>

            <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-200 shadow-sm">
              <div className="flex flex-col">
                <div className="text-2xl text-indigo-600 mb-3">
                  <Users className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="text-3xl font-bold text-gray-900 mb-2">42</p>
                  <p className="text-sm font-medium text-gray-700">Active Members</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Member Dashboard Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Monthly Trends Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">My Monthly Progress</h3>
            <div className="space-y-4">
              {/* Simple Bar Chart Representation */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Jobs Completed</span>
                  <span className="text-sm text-gray-500">Last 6 months</span>
                </div>
                <div className="flex items-end space-x-2 h-32">
                  {dashboardData.monthlyTrends.jobsCompleted.map((value, index) => (
                    <div key={index} className="flex-1 bg-blue-500 rounded-t" 
                         style={{ height: `${(value / 25) * 100}%` }}>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  {dashboardData.monthlyTrends.labels.map((label, index) => (
                    <span key={index}>{label}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">My Recent Activity</h3>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className={`p-2 rounded-full ${getStatusColor(activity.status)}`}>
                    {getStatusIcon(activity.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {activity.user} • {activity.date}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {formatCurrency(activity.amount)}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {activity.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Admin Dashboard Section */}
       

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => navigate('/job-scheduler')}
              className="flex items-center justify-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <FileText className="w-5 h-5 text-blue-500" />
              <span className="font-medium text-gray-700">Browse Available Jobs</span>
            </button>
            <button 
              onClick={() => navigate('/my-current-jobs')}
              className="flex items-center justify-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <Clock className="w-5 h-5 text-green-500" />
              <span className="font-medium text-gray-700">My Current Jobs</span>
            </button>
            <button 
              onClick={() => navigate('/my-completed-jobs')}
              className="flex items-center justify-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <CheckCircle className="w-5 h-5 text-purple-500" />
              <span className="font-medium text-gray-700">My Completed Jobs</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

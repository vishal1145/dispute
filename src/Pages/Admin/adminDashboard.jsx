import React, { useState, useEffect } from "react";
import { Users, UserPlus, CheckCircle, XCircle } from "lucide-react";
import AdminDashboard from "../../Data/adminDashboard.json";
import Header from "../../components/header";

export default function Dashboard() {
  const [stats, setStats] = useState({});
  const [membersByState, setMembersByState] = useState([]);
  const [jobsByWeek, setJobsByWeek] = useState([]);

  useEffect(() => {
    setStats(AdminDashboard.stats);
    setMembersByState(AdminDashboard.membersByState);
    setJobsByWeek(AdminDashboard.jobsByWeek);
  }, []);

  return (
    <div className="flex flex-col lg:flex-row h-[100vh] bg-gray-50">
      {/* Header */}
      <Header />

      {/* Content */}
      <div className="flex-1 p-4 sm:p-6 space-y-6 max-w-7xl mx-auto w-full overflow-y-auto">
        <h2 className="text-lg sm:text-2xl font-bold text-gray-700">
          📊 Admin Dashboard
        </h2>

        {/* Top Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* New Members */}
          <div className="bg-orange-100 shadow rounded-2xl p-4 flex flex-col">
            <div className="flex items-center gap-2">
              <UserPlus className="text-orange-600" />
              <span className="font-medium text-gray-700 text-sm sm:text-base">
                New Members
              </span>
            </div>
            <span className="text-xl sm:text-2xl font-bold text-orange-600 mt-2">
              {stats.newMembers}
            </span>
          </div>

          {/* Total Members */}
          <div className="bg-blue-100 shadow rounded-2xl p-4 flex flex-col">
            <div className="flex items-center gap-2">
              <Users className="text-blue-600" />
              <span className="font-medium text-gray-700 text-sm sm:text-base">
                Total Members
              </span>
            </div>
            <span className="text-xl sm:text-2xl font-bold text-blue-600 mt-2">
              {stats.totalMembers}
            </span>
          </div>

          {/* Active Members */}
          <div className="bg-green-100 shadow rounded-2xl p-4 flex flex-col">
            <div className="flex items-center gap-2">
              <CheckCircle className="text-green-600" />
              <span className="font-medium text-gray-700 text-sm sm:text-base">
                Active Members
              </span>
            </div>
            <span className="text-xl sm:text-2xl font-bold text-green-600 mt-2">
              {stats.activeMembers}
            </span>
          </div>

          {/* Rejected Members */}
          <div className="bg-red-100 shadow rounded-2xl p-4 flex flex-col">
            <div className="flex items-center gap-2">
              <XCircle className="text-red-600" />
              <span className="font-medium text-gray-700 text-sm sm:text-base">
                Rejected Members
              </span>
            </div>
            <span className="text-xl sm:text-2xl font-bold text-red-600 mt-2">
              {stats.rejectedMembers}
            </span>
          </div>
        </div>

        {/* Members by State */}
        <div className="bg-white shadow rounded-2xl p-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-600 mb-3">
            Members by State
          </h3>
          <ul className="space-y-4">
            {membersByState.map((s, idx) => (
              <li
                key={idx}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
              >
                <span className="font-medium text-sm sm:text-base">
                  {s.state}
                </span>
                <div className="flex-1 bg-gray-200 h-3 rounded relative overflow-hidden">
                  <div
                    className="bg-blue-500 h-3 rounded"
                    style={{
                      width: `${(s.count / stats.totalMembers) * 100}%`,
                    }}
                  ></div>
                </div>
                <span className="text-gray-600 text-sm sm:text-base">
                  {s.count}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Jobs By Week */}
        <div className="bg-white shadow rounded-2xl p-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-600 mb-3">
            Jobs (This Month)
          </h3>
          <div className="space-y-4">
            {jobsByWeek.map((week, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex flex-col sm:flex-row sm:justify-between text-sm sm:text-base font-medium">
                  <span>{week.week}</span>
                  <span>
                    {week.jobs} Jobs | {week.booked} Booked
                  </span>
                </div>
                <div className="w-full bg-gray-200 h-3 rounded flex overflow-hidden">
                  <div
                    className="bg-blue-500 h-3"
                    style={{
                      width: `${
                        (week.jobs /
                          Math.max(...jobsByWeek.map((j) => j.jobs))) *
                        100
                      }%`,
                    }}
                  ></div>
                  <div
                    className="bg-orange-500 h-3"
                    style={{
                      width: `${
                        (week.booked /
                          Math.max(...jobsByWeek.map((j) => j.jobs))) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

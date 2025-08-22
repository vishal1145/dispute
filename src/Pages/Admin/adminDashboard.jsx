import React, { useState, useEffect } from "react";
import { Users, UserPlus, CheckCircle, XCircle } from "lucide-react";
import AdminDashboard from "../../Data/adminDashboard.json";
import Header from "../../components/header";
import axios from "axios";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

export default function Dashboard() {
  const baseUrl = process.env.REACT_APP_Base_Url;
  const [stats, setStats] = useState({});
  const [membersByState, setMembersByState] = useState([]);
  const [jobsByWeek, setJobsByWeek] = useState([]);
  const [members, setMembers] = useState("");
  const [month, setMonth] = useState("");
  const [weeks, setWeeks] = useState("");
  const [loading, setLoading] = useState(false); // single loader in list

  useEffect(() => {
    // setMembers(statistics.members);
    setMembersByState(AdminDashboard.membersByState);
    setJobsByWeek(AdminDashboard.jobsByWeek);
  }, []);

  const handleDashboard = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${baseUrl}/stats/members`);
      setMembers(data?.statistics || {});
    } catch (err) {
      console.error("Error fetching jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleDashboard();
    monthlyJObs();
    weeklyJobs();
  }, []);

  const monthlyJObs = async () => {
    try {
      const { data } = await axios.get(
        `${baseUrl}/stats/jobs/analytics?period=month`
      );
      setMonth(data?.analytics || {});
    } catch (err) {
      console.error("Error fetching jobs:", err);
    }
  };

  const weeklyJobs = async () => {
    try {
      const { data } = await axios.get(
        `${baseUrl}/stats/jobs/analytics?period=week`
      );
      setWeeks(data?.analytics || {});
    } catch (err) {
      console.error("Error fetching jobs:", err);
    }
  };

  return (
    <div className="flex flex-col md:flex-row lg:flex-row h-[100vh] bg-gray-50">
      {/* Header */}
      <Header />

      {/* Content */}
      <div className="flex-1 p-4 sm:p-6 space-y-6  mx-auto w-full overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome back! Here's your dispute resolution activity overview.
          </p>
        </div>
        {/* Loader Overlay */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <CircularProgress />
            </Box>
          </div>
        ) : (
          <>
            {/* Top Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* New Members */}
              <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-200 shadow-sm">
                <div className="flex items-center gap-2">
                  <UserPlus className="text-emerald-600" />
                </div>
                <h1 className="text-xl sm:text-2xl text-gray-900  font-bold mt-2">
                  {members.newMembers}
                </h1>
                <p className="font-medium text-gray-700  sm:text-base">
                  New members in this month
                </p>
              </div>

              {/* Total Members */}
              <div className="bg-sky-50 rounded-xl p-6 border border-sky-200 shadow-sm">
                <div className="flex items-center gap-2">
                  <Users className="text-sky-600" />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900  mt-2">
                  {members.totalMembers}
                </h1>
                <p className="font-medium text-gray-700 text-sm sm:text-base">
                  Total Members
                </p>
              </div>

              {/* Active Members */}
              <div className="bg-amber-50 rounded-xl p-6 border border-amber-200 shadow-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-amber-600" />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900  mt-2">
                  {members.activeMembers}
                </h1>
                <p className="font-medium text-gray-700 text-sm sm:text-base">
                  Active Members
                </p>
              </div>

              {/* Rejected Members */}
              <div className="bg-violet-50 rounded-xl p-6 border border-violet-200 shadow-sm">
                <div className="flex items-center gap-2">
                  <XCircle className="text-violet-600" />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900  mt-2">
                  {members.rejectedMembers}
                </h1>
                <p className="font-medium text-gray-700 text-sm sm:text-base">
                  Rejected Members
                </p>
              </div>
            </div>

            {/* Members Posted jobas*/}

            <div>
              <div className=" grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className=" bg-orange-50 rounded-xl p-6 border border-orange-200 shadow-sm">
                  <div className="flex flex-col gap-3">
                    <h1 className="text-2xl font-bold text-gray-900">
                      Monthly Jobs Status
                    </h1>
                    <div className="flex gap-2">
                      <p className="font-medium text-gray-700 text-sm sm:text-base">
                        Posted jobs :
                      </p>
                      <p>{month.jobsPosted}</p>
                    </div>
                    <div className="flex gap-2">
                      <p className="font-medium text-gray-700 text-sm sm:text-base">
                        Completed Jobs :
                      </p>
                      <p>{month.jobsCompleted}</p>
                    </div>
                    <div className="flex gap-2">
                      <p className="font-medium text-gray-700 text-sm sm:text-base">
                        Booked Jobs :
                      </p>
                      <p>{month.jobsBooked}</p>
                    </div>
                    <div className="flex gap-2">
                      <p className="font-medium text-gray-700 text-sm sm:text-base">
                        Aborted Jobs :
                      </p>
                      <p>{month.jobsAborted}</p>
                    </div>
                  </div>
                </div>
                <div className=" bg-indigo-50 rounded-xl p-6 border border-indigo-200 shadow-sm">
                  <div className="flex flex-col gap-3">
                    <h1 className="text-2xl font-bold text-gray-900">
                      Weekly Jobs Status
                    </h1>
                    <div className="flex gap-2">
                      <p className="font-medium text-gray-700 text-sm sm:text-base">
                        Posted jobs :
                      </p>
                      <p>{weeks.jobsPosted}</p>
                    </div>
                    <div className="flex gap-2">
                      <p className="font-medium text-gray-700 text-sm sm:text-base">
                        Completed Jobs :
                      </p>
                      <p>{weeks.jobsCompleted}</p>
                    </div>
                    <div className="flex gap-2">
                      <p className="font-medium text-gray-700 text-sm sm:text-base">
                        Booked Jobs :
                      </p>
                      <p>{weeks.jobsBooked}</p>
                    </div>
                    <div className="flex gap-2">
                      <p className="font-medium text-gray-700 text-sm sm:text-base">
                        Aborted Jobs :
                      </p>
                      <p>{weeks.jobsAborted}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Members by State */}
            {/* <div className="bg-white shadow rounded-2xl p-4">
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
            </div> */}

            {/* Jobs By Week */}
            {/* <div className="bg-white shadow rounded-2xl p-4">
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
            </div> */}
          </>
        )}
      </div>
    </div>
  );
}

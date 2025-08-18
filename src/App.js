import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import JobSchedule from "./Pages/jobSchedule";
import MyCurrentJobs from "./Pages/myCurrentJobs";
import MyCompletedJobs from "./Pages/myCompletedJobs";
import MyAccount from "./Pages/myAccount";
import CreateJobs from "./Pages/createJobs";
// import Navbar from "./components/navbar";
import MemberApprove from "./Pages/Admin/memberApprove";
import CreateJob from "./Pages/Admin/createjob";
import JobList from "./Pages/Admin/jobList";
import Account from "./Pages/Admin/account";

export default function App() {
  return (
    <div>
      <Router>
        {/* < Navbar /> */}
        <Routes>
          <Route path="/job-scheduler" element={<JobSchedule />} />
          <Route path="/my-current-jobs" element={<MyCurrentJobs />} />
          <Route path="/my-completed-jobs" element={<MyCompletedJobs />} />
          <Route path="/my-account" element={<MyAccount />} />

          {/* Admin Routes */}
          <Route path="/admin/member-list" element={<MemberApprove />} />
          <Route path="/admin/create-job" element={<CreateJob />} />
          <Route path="/admin/job-list" element={<JobList />} />
          <Route path="/admin/account" element={<Account />} />
        </Routes>
      </Router>
    </div>
  );
}

// C:\Users\abdul\Downloads\FinalYearProject-main\FinalYearProject-main\Frontend\src\App.jsx

import React from "react";
<<<<<<< HEAD
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Login from "./pages/auth/Login"
import Register from "./pages/auth/Register"
=======
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout1";
>>>>>>> d7e771665b5422a549fae183628fca03e9fab8b1
import Dashboard from "./pages/dashboard/Dashboard";
import EmailIntegration from "./pages/email/EmailIntegration";
import CreateJob from "./pages/jobs/CreateJobs";
import ManageResumes from "./pages/resumes/ManageResumes";
import SetupCriteria from "./pages/resumes/SetupCriteria";
import InterviewScheduler from "./pages/scheduling/Scheduling";
import Reports from "./pages/reports/Reports";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ResumeExtractor from "./components/email/ResumeExtractor";

const App = () => {
  // For demo purposes, let's assume the user is logged in
  const isLoggedIn = true;

  return (
    <Router>
<<<<<<< HEAD
      <MainLayout>
        <Routes>
          {/* Define routes for your pages */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/email-integration" element={<EmailIntegration />} />
          <Route path="/create-job" element={<CreateJob />} />
          <Route path="/manage-resumes" element={<ManageResumes />} />
          <Route path="/setup-criteria" element={<SetupCriteria />} />
          <Route path="/interview-scheduler" element={<InterviewScheduler />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </MainLayout>
=======
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={!isLoggedIn ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!isLoggedIn ? <Register /> : <Navigate to="/" />} />

        {/* Protected Routes */}
        <Route 
          path="/*" 
          element={
            isLoggedIn ? (
              <MainLayout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/email-integration" element={<EmailIntegration />} />

                  <Route path="/create-job" element={<CreateJob />} />
                  <Route path="/manage-resumes" element={<ManageResumes />} />
                  <Route path="/setup-criteria" element={<SetupCriteria />} />
                  <Route path="/interview-scheduler" element={<InterviewScheduler />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/settings" element={<div>Settings Page</div>} />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </MainLayout>
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
      </Routes>
>>>>>>> d7e771665b5422a549fae183628fca03e9fab8b1
    </Router>
  );
};

export default App;

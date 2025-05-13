import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/dashboard/Dashboard";
import EmailIntegration from "./pages/email/EmailIntegration";
import CreateJob from "./pages/jobs/CreateJobs";
import ManageResumes from "./pages/resumes/ManageResumes";
import SetupCriteria from "./pages/resumes/SetupCriteria";
import InterviewScheduler from "./pages/scheduling/Scheduling";
import Reports from "./pages/reports/Reports";
import Settings from "./pages/settings/Settings";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// For development - hardcoded auth state
// Remove this and uncomment the useAuth import when backend is connected
// import { useAuth } from "./contexts/AuthContext";

const App = () => {
  // For development - hardcoded authentication
  // Replace with the line below when backend is connected
  // const { isAuthenticated, loading } = useAuth();
  const isAuthenticated = true; // Hardcoded for development
  const loading = false; // Hardcoded for development

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route
          path="/login"
          element={!isAuthenticated ? <Login /> : <Navigate to="/" />}
        />
        <Route
          path="/register"
          element={!isAuthenticated ? <Register /> : <Navigate to="/" />}
        />

        {/* Protected Routes */}
        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <MainLayout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/email-integration" element={<EmailIntegration />} />
                  <Route path="/create-job" element={<CreateJob />} />
                  <Route path="/manage-resumes" element={<ManageResumes />} />
                  <Route path="/setup-criteria" element={<SetupCriteria />} />
                  <Route path="/interview-scheduler" element={<InterviewScheduler />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </MainLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
};

export default App;

import React from 'react';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/dashboard/Dashboard';
import EmailIntegration from './pages/email/EmailIntegration';
import CreateJob from './pages/jobs/CreateJobs';
import ManageResumes from './pages/resumes/ManageResumes';
import SetupCriteria from './pages/resumes/SetupCriteria';
import InterviewScheduler from './pages/scheduling/Scheduling';
import Reports from './pages/reports/Reports';

const App = () => {
  // In a real application, you would use a router to handle navigation
  // For now, we'll just show the dashboard
  return (
    <MainLayout>
      <Dashboard />
    </MainLayout>
  );
};

export default App;

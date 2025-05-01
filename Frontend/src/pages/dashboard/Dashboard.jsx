// C:\Users\abdul\Downloads\FinalYearProject-main\FinalYearProject-main\Frontend\src\pages\dashboard\Dashboard.jsx

import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Mail,
  User,
  FileText,
  Calendar,
  Settings,
  BarChart,
  Plus,
  Upload,
  Search,
  X,
} from "lucide-react";
import React, { useState } from "react";

// Create Job Modal Component
const CreateJobModal = ({ isOpen, onClose, onSubmit }) => {
  const [jobData, setJobData] = useState({
    title: "",
    department: "",
    description: "",
    startDate: "",
    endDate: "",
    requiredSkills: "",
    qualifications: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setJobData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(jobData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Create New Job Opening</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Job Title</label>
              <input
                type="text"
                name="title"
                value={jobData.title}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Department</label>
              <select
                name="department"
                value={jobData.department}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
                required
              >
                <option value="">Select Department</option>
                <option value="engineering">Engineering</option>
                <option value="product">Product</option>
                <option value="design">Design</option>
                <option value="marketing">Marketing</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Job Description</label>
            <textarea
              name="description"
              value={jobData.description}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              rows="4"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={jobData.startDate}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <input
                type="date"
                name="endDate"
                value={jobData.endDate}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Required Skills</label>
            <textarea
              name="requiredSkills"
              value={jobData.requiredSkills}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              rows="3"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Qualifications</label>
            <textarea
              name="qualifications"
              value={jobData.qualifications}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              rows="3"
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-500 hover:bg-blue-600">
              Create Job Opening
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [isCreateJobModalOpen, setIsCreateJobModalOpen] = useState(false);
  const [jobOpenings, setJobOpenings] = useState([
    {
      id: 1,
      title: "Senior Software Engineer",
      status: "open",
      applications: 45,
      shortlisted: 12,
      interviews: 8,
      startDate: "2024-01-15",
      endDate: "2024-02-15",
    },
    {
      id: 2,
      title: "Product Manager",
      status: "open",
      applications: 32,
      shortlisted: 8,
      interviews: 4,
      startDate: "2024-01-20",
      endDate: "2024-02-20",
    },
    {
      id: 3,
      title: "UX Designer",
      status: "closed",
      applications: 28,
      shortlisted: 6,
      interviews: 3,
      startDate: "2024-01-10",
      endDate: "2024-01-31",
    },
  ]);

  const handleCreateJob = (newJobData) => {
    const newJob = {
      id: jobOpenings.length + 1,
      ...newJobData,
      status: "open",
      applications: 0,
      shortlisted: 0,
      interviews: 0,
    };
    setJobOpenings([...jobOpenings, newJob]);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="p-8">
        {/* Action Buttons */}
        <div className="flex space-x-4 mb-8">
          <Button 
            className="bg-blue-500 hover:bg-blue-600"
            onClick={() => setIsCreateJobModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Job Opening
          </Button>
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Import Resumes
          </Button>
        </div>

        {/* Job Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Active Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-500">
                {jobOpenings.filter((job) => job.status === "open").length}
              </div>
              <p className="text-gray-500">Currently active job openings</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">
                {jobOpenings.reduce((acc, job) => acc + job.applications, 0)}
              </div>
              <p className="text-gray-500">Applications received</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Interviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-500">
                {jobOpenings.reduce((acc, job) => acc + job.interviews, 0)}
              </div>
              <p className="text-gray-500">Upcoming interviews</p>
            </CardContent>
          </Card>
        </div>

        {/* Job Listings Table */}
        <Card>
          <CardHeader>
            <CardTitle>Active Job Openings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Job Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Start Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      End Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applications
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Shortlisted
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Interviews
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {jobOpenings.map((job) => (
                    <tr key={job.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {job.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            job.status === "open"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {job.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {job.startDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {job.endDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {job.applications}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {job.shortlisted}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {job.interviews}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Create Job Modal */}
      <CreateJobModal
        isOpen={isCreateJobModalOpen}
        onClose={() => setIsCreateJobModalOpen(false)}
        onSubmit={handleCreateJob}
      />
    </div>
  );
};

export default Dashboard;

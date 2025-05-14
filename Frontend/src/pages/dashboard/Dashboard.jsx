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
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
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

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="p-8">
        {/* Action Buttons */}
        <div className="flex space-x-4 mb-8">
          <Button 
            className="bg-blue-500 hover:bg-blue-600 p-2"
            onClick={() => navigate("/create-job")}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Job Opening
          </Button>
          <Button variant="outline" className="hover:text-gray-500">
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
                    <tr key={job.id} className="hover:bg-gray-50">
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
    </div>
  );
};

export default Dashboard;

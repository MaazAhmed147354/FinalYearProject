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
  MessageSquare,
  Bell,
  Plus,
  Upload,
  Search,
} from "lucide-react";
import React, { useState } from "react";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const jobOpenings = [
    {
      id: 1,
      title: "Senior Software Engineer",
      status: "open",
      applications: 45,
      shortlisted: 12,
      interviews: 8,
    },
    {
      id: 2,
      title: "Product Manager",
      status: "open",
      applications: 32,
      shortlisted: 8,
      interviews: 4,
    },
    {
      id: 3,
      title: "UX Designer",
      status: "closed",
      applications: 28,
      shortlisted: 6,
      interviews: 3,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold text-gray-800">
                Smart Resume Parser
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Bell className="w-5 h-5 text-gray-500" />
              <User className="w-5 h-5 text-gray-500" />
            </div>
          </div>
        </div>
      </nav> */}

      <div className="flex">
        {/* Sidebar
        <aside className="w-64 bg-white h-screen shadow-sm">
          <nav className="mt-8">
            <a
              className={`flex items-center px-6 py-3 text-gray-700 cursor-pointer ${
                activeTab === "dashboard"
                  ? "bg-blue-50 border-l-4 border-blue-500"
                  : ""
              }`}
              onClick={() => setActiveTab("dashboard")}
            >
              <BarChart className="w-5 h-5 mr-3" />
              Dashboard
            </a>
            <a
              className={`flex items-center px-6 py-3 text-gray-700 cursor-pointer ${
                activeTab === "emails"
                  ? "bg-blue-50 border-l-4 border-blue-500"
                  : ""
              }`}
              onClick={() => setActiveTab("emails")}
            >
              <Mail className="w-5 h-5 mr-3" />
              Email Integration
            </a>
            <a
              className={`flex items-center px-6 py-3 text-gray-700 cursor-pointer ${
                activeTab === "resumes"
                  ? "bg-blue-50 border-l-4 border-blue-500"
                  : ""
              }`}
              onClick={() => setActiveTab("resumes")}
            >
              <FileText className="w-5 h-5 mr-3" />
              Resume Management
            </a>
            <a
              className={`flex items-center px-6 py-3 text-gray-700 cursor-pointer ${
                activeTab === "calendar"
                  ? "bg-blue-50 border-l-4 border-blue-500"
                  : ""
              }`}
              onClick={() => setActiveTab("calendar")}
            >
              <Calendar className="w-5 h-5 mr-3" />
              Interview Scheduler
            </a>
            <a
              className={`flex items-center px-6 py-3 text-gray-700 cursor-pointer ${
                activeTab === "settings"
                  ? "bg-blue-50 border-l-4 border-blue-500"
                  : ""
              }`}
              onClick={() => setActiveTab("settings")}
            >
              <Settings className="w-5 h-5 mr-3" />
              Settings
            </a>
          </nav>
        </aside> */}

        {/* Main Content */}
        <main className="flex-1 p-8">
          {/* Action Buttons */}
          <div className="flex space-x-4 mb-8">
            <Button className="bg-blue-500 hover:bg-blue-600">
              <Plus className="w-4 h-4 mr-2" />
              Create Job Opening
            </Button>
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Import Resumes
            </Button>
          </div>

          {/* Job Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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

        {/* Right Sidebar - Notifications & Chat */}
        <aside className="w-64 bg-white h-screen shadow-sm p-4">
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Notifications</h3>
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  New application received for Senior Software Engineer
                </p>
                <span className="text-xs text-gray-400">2 minutes ago</span>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  Interview scheduled with John Doe
                </p>
                <span className="text-xs text-gray-400">1 hour ago</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Team Chat</h3>
            <div className="border rounded-lg p-4">
              <div className="space-y-4 mb-4">
                <div className="flex items-start space-x-2">
                  <User className="w-8 h-8 p-1 bg-gray-100 rounded-full" />
                  <div className="bg-gray-100 rounded-lg p-2">
                    <p className="text-sm">
                      Let's review the shortlisted candidates
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 p-2 border rounded-lg text-sm"
                />
                <MessageSquare className="w-5 h-5 text-gray-500 cursor-pointer" />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Dashboard;

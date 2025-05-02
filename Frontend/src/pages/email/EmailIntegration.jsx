import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Calendar, Filter, Download, Eye, Trash2, Mail, Search } from "lucide-react";
import React, { useState } from "react";

const EmailIntegration = () => {
  const [filterParams, setFilterParams] = useState({
    startDate: "",
    endDate: "",
    subject: "",
  });

  const [emails, setEmails] = useState([
    {
      id: 1,
      sender: "john.doe@example.com",
      subject: "Application for Senior Software Engineer",
      date: "2024-01-25",
      hasResume: true,
      status: "pending",
    },
    {
      id: 2,
      sender: "jane.smith@example.com",
      subject: "Product Manager Position Application",
      date: "2024-01-26",
      hasResume: true,
      status: "imported",
    },
    {
      id: 3,
      sender: "michael.brown@example.com",
      subject: "Job Application - UX Designer",
      date: "2024-01-27",
      hasResume: true,
      status: "pending",
    },
    {
      id: 4,
      sender: "sarah.wilson@example.com",
      subject: "Frontend Developer Role - Resume Attached",
      date: "2024-01-28",
      hasResume: true,
      status: "pending",
    },
  ]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterParams(prev => ({ ...prev, [name]: value }));
  };

  const handleDateFilter = () => {
    // Implement date filtering logic
    console.log("Filtering with params:", filterParams);
  };

  const handleImportAll = () => {
    // Implement bulk import logic
    console.log("Importing all resumes");
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Email Integration</span>
            <Button
              onClick={handleImportAll}
              className="hover:text-gray-500"
            >
              <Download className="w-4 h-4 mr-2" />
              Import All Resumes
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filter Section */}
          <div className="mb-6 flex flex-wrap gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  name="startDate"
                  value={filterParams.startDate}
                  onChange={handleFilterChange}
                  className="pl-10 p-2 border rounded-md"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  name="endDate"
                  value={filterParams.endDate}
                  onChange={handleFilterChange}
                  className="pl-10 p-2 border rounded-md"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Subject</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="subject"
                  value={filterParams.subject}
                  onChange={handleFilterChange}
                  className="pl-10 p-2 border rounded-md"
                  placeholder="Filter by subject keywords"
                />
              </div>
            </div>
            <Button onClick={handleDateFilter} variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter Emails
            </Button>
          </div>

          {/* Emails Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sender
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {emails.map((email) => (
                  <tr key={email.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {email.sender}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {email.subject}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{email.date}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          email.status === "imported"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {email.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-600 hover:text-green-900"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailIntegration;

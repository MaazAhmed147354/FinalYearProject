import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Calendar, Filter, Download, Eye, Trash2, Mail, Search, RefreshCw } from "lucide-react";
import React, { useState, useEffect } from "react";
import EmailService from "../../services/EmailService";
import JobService from "../../services/JobService";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const EmailIntegration = () => {
  const navigate = useNavigate();
  const [filterParams, setFilterParams] = useState({
    startDate: "",
    endDate: "",
    subject: "",
  });

  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [jobs, setJobs] = useState([]);
  const [openJobs, setOpenJobs] = useState([]);

  useEffect(() => {
    fetchEmails();
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await JobService.listJobs({ status: "open" });
      if (response.data && response.data.data) {
        setJobs(response.data.data);
        setOpenJobs(response.data.data.filter(job => job.status === 'open'));
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      toast.error("Failed to fetch jobs: " + error.message);
    }
  };

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const response = await EmailService.listEmails();
      setEmails(response.data.data || []);
    } catch (error) {
      toast.error("Failed to fetch emails: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterParams(prev => ({ ...prev, [name]: value }));
  };

  const handleDateFilter = async () => {
    try {
      setLoading(true);
      const response = await EmailService.listEmails({
        start_date: filterParams.startDate,
        end_date: filterParams.endDate,
        search: filterParams.subject
      });
      setEmails(response.data.data || []);
    } catch (error) {
      toast.error("Failed to filter emails: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncEmails = async () => {
    try {
      setSyncing(true);
      const response = await EmailService.syncEmails();
      toast.success("Emails synchronized successfully!");
      fetchEmails(); // Refresh the email list
    } catch (error) {
      toast.error("Failed to sync emails: " + error.message);
    } finally {
      setSyncing(false);
    }
  };

  const handleDownloadResume = async (emailId) => {
    try {
      // Just download the resume without requiring job selection
      await EmailService.downloadResume(emailId);
    } catch (error) {
      toast.error("Failed to download resume: " + error.message);
    }
  };

  const handleExtractResume = async (emailId) => {
    if (!selectedJobId) {
      toast.error("Please select a job first");
      return;
    }

    try {
      const response = await EmailService.extractResumeFromEmail(emailId, selectedJobId);
      toast.success("Resume extracted successfully!");
      fetchEmails(); // Refresh to update status
    } catch (error) {
      toast.error("Failed to extract resume: " + error.message);
    }
  };

  const handleJobSelection = (jobId) => {
    setSelectedJobId(jobId);
    
    // We're removing the navigation to Resume Management page
    // as this will be handled by the ManageResumes component directly
    console.log("Selected job ID:", jobId);
  };

  const handleUpdateStatus = async (emailId, status) => {
    try {
      await EmailService.updateEmailStatus(emailId, status);
      toast.success("Email status updated successfully!");
      fetchEmails(); // Refresh to show updated status
    } catch (error) {
      toast.error("Failed to update status: " + error.message);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Email Integration</CardTitle>
            <div className="flex gap-4">
              <select
                className="border rounded-md p-2"
                value={selectedJobId}
                onChange={(e) => handleJobSelection(e.target.value)}
              >
                <option value="">Select Job for Extraction</option>
                {openJobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title}
                  </option>
                ))}
              </select>
              <Button 
                onClick={handleSyncEmails} 
                disabled={syncing}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Syncing...' : 'Sync Emails'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filter Section */}
          <div className="flex gap-4 mb-6">
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
            <Button onClick={handleDateFilter} variant="outline" disabled={loading}>
              <Filter className="w-4 h-4 mr-2" />
              {loading ? 'Filtering...' : 'Filter Emails'}
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
                      <div className="text-sm text-gray-900">{email.sender}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{email.subject}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(email.received_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          email.status === "imported"
                            ? "bg-green-100 text-green-800"
                            : email.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : email.status === "spam"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {email.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        {email.has_resume && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadResume(email.id)}
                              title="Download Original Resume"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            {email.status === 'pending' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleExtractResume(email.id)}
                                title="Extract and Download Processed Resume"
                                disabled={!selectedJobId}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            )}
                          </>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateStatus(email.id, 'rejected')}
                          title="Mark as Rejected"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {emails.length === 0 && !loading && (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                      No emails found
                    </td>
                  </tr>
                )}
                {loading && (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailIntegration;

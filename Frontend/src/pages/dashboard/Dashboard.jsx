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
  Loader,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import JobService from "../../services/JobService";
import DashboardService from "../../services/DashboardService";
import { useToast } from "../../components/ui/toast";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [jobOpenings, setJobOpenings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalApplications: 0,
    scheduledInterviews: 0,
  });

  // Fetch dashboard data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Try to get dashboard stats first
      try {
        const statsResponse = await DashboardService.getDashboardStats();
        if (statsResponse.data && statsResponse.data.success) {
          setStats({
            activeJobs: statsResponse.data.activeJobs || 0,
            totalApplications: statsResponse.data.totalApplications || 0,
            scheduledInterviews: statsResponse.data.scheduledInterviews || 0,
          });
        }
      } catch (statError) {
        console.log("Stats endpoint not available, using fallback");
        // Fallback: calculate stats from job list
        const fallbackStats = await DashboardService.calculateDashboardStats();
        setStats({
          activeJobs: fallbackStats.data.activeJobs || 0,
          totalApplications: fallbackStats.data.totalApplications || 0,
          scheduledInterviews: fallbackStats.data.scheduledInterviews || 0,
        });
        
        // Use jobs from fallback stats
        if (fallbackStats.data.jobs && fallbackStats.data.jobs.length > 0) {
          // Format jobs for display
          const formattedJobs = fallbackStats.data.jobs.map(job => ({
            id: job.id,
            title: job.title,
            status: job.status || 'open',
            applications: job.applications_count || 0,
            shortlisted: job.shortlisted_count || 0,
            interviews: job.interviews_count || 0,
            startDate: formatDate(job.start_date),
            endDate: formatDate(job.end_date),
          }));
          setJobOpenings(formattedJobs);
          setLoading(false);
          return;
        }
      }
      
      // If we didn't return above, fetch jobs separately
      const jobsResponse = await JobService.listJobs();
      if (jobsResponse.data && jobsResponse.data.data) {
        // Format jobs for display
        const formattedJobs = jobsResponse.data.data.map(job => ({
          id: job.id,
          title: job.title,
          status: job.status || 'open',
          applications: job.applications_count || 0,
          shortlisted: job.shortlisted_count || 0,
          interviews: job.interviews_count || 0,
          startDate: formatDate(job.start_date),
          endDate: formatDate(job.end_date),
        }));
        setJobOpenings(formattedJobs);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive",
      });
      
      // Set default mock data for demonstration
      setJobOpenings([
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
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleImportJobOpenings = async () => {
    try {
      setImporting(true);
      const response = await DashboardService.importJobOpenings();
      
      if (response.data && response.data.success) {
        toast({
          title: "Success",
          description: `${response.data.message || "Job openings imported successfully"}`,
        });
        
        // Refresh dashboard data
        fetchDashboardData();
      }
    } catch (error) {
      console.error("Error importing job openings:", error);
      toast({
        title: "Error",
        description: "Failed to import job openings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  // Helper function to format dates
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

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
          <Button 
            variant="outline" 
            className="hover:text-gray-500"
            onClick={handleImportJobOpenings}
            disabled={importing}
          >
            {importing ? (
              <Loader className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Upload className="w-4 h-4 mr-2" />
            )}
            Import Job Openings
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <>
            {/* Job Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Active Jobs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-500">
                    {stats.activeJobs}
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
                    {stats.totalApplications}
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
                    {stats.scheduledInterviews}
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
                {jobOpenings.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No job openings found. Create a new job or import job openings.
                  </div>
                ) : (
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
                          <tr 
                            key={job.id} 
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => navigate(`/jobs/${job.id}`)}
                          >
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
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;

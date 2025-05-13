import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { TrendingUp, Users, CheckCircle, Clock, Download, AlertCircle } from "lucide-react";
import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Import the analytics service
import AnalyticsService from "../../services/AnalyticsService";

const Reports = () => {
  // State to store API data
  const [jobAnalytics, setJobAnalytics] = useState(null);
  const [resumeAnalytics, setResumeAnalytics] = useState(null);
  const [interviewAnalytics, setInterviewAnalytics] = useState(null);
  const [funnelAnalytics, setFunnelAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all data in parallel
        const [jobData, resumeData, interviewData, funnelData] = await Promise.all([
          AnalyticsService.getJobAnalytics(),
          AnalyticsService.getResumeAnalytics(),
          AnalyticsService.getInterviewAnalytics(),
          AnalyticsService.getRecruitmentFunnelAnalytics()
        ]);
        
        // Add these debug lines
        console.log("Job Analytics Response:", jobData);
        console.log("Resume Analytics Response:", resumeData);
        console.log("Interview Analytics Response:", interviewData);
        console.log("Funnel Analytics Response:", funnelData);
        
        // Then adjust these lines based on the actual response structure
        // setJobAnalytics(jobData.data);  // Try this if jobData.data.data doesn't work
        // setResumeAnalytics(resumeData.data);
        // setInterviewAnalytics(interviewData.data);
        // setFunnelAnalytics(funnelData.data);

        // TO THESE:
        setJobAnalytics(jobData.data.data);  // Correct - access the nested data
        setResumeAnalytics(resumeData.data.data);  // Correct
        setInterviewAnalytics(interviewData.data.data);  // Correct
        setFunnelAnalytics(funnelData.data.data);  // Correct
        
        setError(null);
      } catch (err) {
        console.error("Error fetching analytics data:", err);
        setError("Failed to load analytics data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Sample data for charts (used as fallback)
  const applicationTrends = [
    { month: "Jan", applications: 150, shortlisted: 45, hired: 12 },
    { month: "Feb", applications: 180, shortlisted: 55, hired: 15 },
    { month: "Mar", applications: 220, shortlisted: 65, hired: 18 },
    { month: "Apr", applications: 250, shortlisted: 75, hired: 20 },
  ];

  const sourcingChannels = [
    { name: "LinkedIn", value: 45 },
    { name: "Company Website", value: 30 },
    { name: "Job Boards", value: 15 },
    { name: "Referrals", value: 10 },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  // Metrics data (use API data if available, otherwise fall back to sample data)
  const getMetrics = () => {
    if (loading || !resumeAnalytics || !funnelAnalytics || !jobAnalytics) {
      return [
        {
          title: "Total Applications",
          value: resumeAnalytics?.total_resumes ?? 0,
          change: "+12%",
          icon: Users,
        },
        {
          title: "Average Time to Hire",
          value: `${Math.round(jobAnalytics?.time_to_fill?.avg_days ?? 0)} days`,
          change: "-5%",
          icon: Clock,
        },
        {
          title: "Shortlist Rate",
          value: `${Math.round(funnelAnalytics?.shortlist_rate ?? 0)}%`,
          change: "+3%", 
          icon: CheckCircle,
        },
        {
          title: "Conversion Rate",
          value: `${Math.min(Math.round(funnelAnalytics?.interview_rate ?? 0), 100)}%`,
          change: "+1.5%",
          icon: TrendingUp,
        },
      ];
    }

    return [
      {
        title: "Total Applications",
        value: resumeAnalytics.total_resumes || 0,
        change: "+12%", // This would need historical data to calculate
        icon: Users,
      },
      {
        title: "Average Time to Hire",
        value: `${Math.round(jobAnalytics.time_to_fill?.avg_days || 0)} days`,
        change: "-5%", // This would need historical data to calculate
        icon: Clock,
      },
      {
        title: "Shortlist Rate",
        value: `${Math.round(funnelAnalytics.shortlist_rate || 0)}%`,
        change: "+3%", // This would need historical data to calculate
        icon: CheckCircle,
      },
      {
        title: "Conversion Rate",
        value: `${Math.round(funnelAnalytics.interview_rate || 0)}%`,
        change: "+1.5%", // This would need historical data to calculate
        icon: TrendingUp,
      },
    ];
  };

  // Get department data for charts
  const getDepartmentData = () => {
    if (loading || !jobAnalytics || !jobAnalytics.jobs_by_department) {
      return [
        { department: "Engineering", openings: 12, filled: 8 },
        { department: "Product", openings: 8, filled: 5 },
        { department: "Design", openings: 6, filled: 4 },
        { department: "Marketing", openings: 4, filled: 2 },
      ];
    }

    return jobAnalytics.jobs_by_department.map(dept => ({
      department: dept.department || 'Unknown',
      openings: parseInt(dept.count) || 0,
      filled: 0 // This data isn't available from the API yet
    }));
  };

  // Show loading state
  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Clock className="w-12 h-12 mx-auto text-blue-500 animate-pulse" />
              <h3 className="mt-4 text-lg font-medium">Loading Analytics</h3>
              <p className="mt-2 text-gray-500">Please wait while we fetch the latest data...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="p-6 flex justify-center items-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 mx-auto text-red-500" />
              <h3 className="mt-4 text-lg font-medium">Error Loading Analytics</h3>
              <p className="mt-2 text-gray-500">{error}</p>
              <Button 
                className="mt-4 bg-blue-500 hover:bg-blue-600" 
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const metrics = getMetrics();

  return (
    <div className="p-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {metric.title}
                  </p>
                  <h3 className="text-2xl font-bold mt-2">{metric.value}</h3>
                  <span
                    className={`text-sm ${
                      metric.change.startsWith("+")
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {metric.change} from last month
                  </span>
                </div>
                <metric.icon className="w-6 h-6 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Application Trends */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Application Trends</CardTitle>
              <Button variant="outline" size="sm" className="underline underline-offset-4 hover:underline-offset-2">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={applicationTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="applications"
                    stroke="#8884d8"
                  />
                  <Line
                    type="monotone"
                    dataKey="shortlisted"
                    stroke="#82ca9d"
                  />
                  <Line type="monotone" dataKey="hired" stroke="#ffc658" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Sourcing Channels */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Sourcing Channels</CardTitle>
              <Button variant="outline" size="sm" className="underline underline-offset-4 hover:underline-offset-2">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sourcingChannels}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {sourcingChannels.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Department-wise Hiring */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Department-wise Hiring</CardTitle>
              <Button variant="outline" size="sm" className="underline underline-offset-4 hover:underline-offset-2">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getDepartmentData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="openings"
                    fill="#8884d8"
                    name="Total Openings"
                  />
                  <Bar
                    dataKey="filled"
                    fill="#82ca9d"
                    name="Positions Filled"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Time to Hire Analysis */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Time to Hire Analysis</CardTitle>
              <Button variant="outline" size="sm" className="underline underline-offset-4 hover:underline-offset-2">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { stage: "CV Screening", days: 3 },
                    { stage: "First Interview", days: 5 },
                    { stage: "Technical Test", days: 4 },
                    { stage: "Final Interview", days: 3 },
                    { stage: "Offer & Negotiation", days: 4 },
                  ]}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="stage" type="category" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="days" fill="#8884d8" name="Average Days" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {/* Resume Quality Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Resume Quality Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">
                    Average Match Score
                  </span>
                  <span className="text-sm font-medium">
                    {resumeAnalytics?.score_statistics?.avg_score 
                      ? `${Math.round(resumeAnalytics.score_statistics.avg_score)}%` 
                      : '75%'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ 
                      width: resumeAnalytics?.score_statistics?.avg_score 
                        ? `${Math.round(resumeAnalytics.score_statistics.avg_score)}%` 
                        : '75%' 
                    }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Skills Match Rate</span>
                  <span className="text-sm font-medium">82%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: "82%" }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">
                    Experience Match Rate
                  </span>
                  <span className="text-sm font-medium">68%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{ width: "68%" }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interview Success Rate */}
        <Card>
          <CardHeader>
            <CardTitle>Interview Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <div className="relative w-40 h-40">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold">
                    {interviewAnalytics?.completion_stats?.completion_rate
                      ? `${Math.round(interviewAnalytics.completion_stats.completion_rate)}%`
                      : '78%'}
                  </span>
                </div>
                <svg className="w-full h-full" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#eee"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#4CAF50"
                    strokeWidth="3"
                    strokeDasharray={`${interviewAnalytics?.completion_stats?.completion_rate || 78}, 100`}
                  />
                </svg>
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  Based on {interviewAnalytics?.total_interviews || 50} interviews
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hiring Pipeline */}
        <Card>
          <CardHeader>
            <CardTitle>Hiring Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">New Applications</span>
                <span className="text-sm font-bold">{resumeAnalytics?.total_resumes || 124}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Screening</span>
                <span className="text-sm font-bold">
                  {resumeAnalytics?.resumes_by_status?.find(s => s.status === 'pending')?.count || 86}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Interview</span>
                <span className="text-sm font-bold">{interviewAnalytics?.total_interviews || 45}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Technical Test</span>
                <span className="text-sm font-bold">28</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Offer Stage</span>
                <span className="text-sm font-bold">12</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Hired</span>
                <span className="text-sm font-bold">{funnelAnalytics?.total_hires || 8}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
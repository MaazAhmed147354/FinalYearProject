import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { TrendingUp, Users, CheckCircle, Clock, Download } from "lucide-react";
import React from "react";
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

const Reports = () => {
  // Sample data for charts
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

  const metrics = [
    {
      title: "Total Applications",
      value: "2,458",
      change: "+12%",
      icon: Users,
    },
    {
      title: "Average Time to Hire",
      value: "18 days",
      change: "-5%",
      icon: Clock,
    },
    {
      title: "Shortlist Rate",
      value: "28%",
      change: "+3%",
      icon: CheckCircle,
    },
    {
      title: "Conversion Rate",
      value: "8.5%",
      change: "+1.5%",
      icon: TrendingUp,
    },
  ];

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
              <Button variant="outline" size="sm">
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
              <Button variant="outline" size="sm">
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
              <Button variant="outline" size="sm">
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
                    { department: "Engineering", openings: 12, filled: 8 },
                    { department: "Product", openings: 8, filled: 5 },
                    { department: "Design", openings: 6, filled: 4 },
                    { department: "Marketing", openings: 4, filled: 2 },
                  ]}
                >
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
              <Button variant="outline" size="sm">
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
                  <span className="text-sm font-medium">75%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: "75%" }}
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
                  <span className="text-3xl font-bold">78%</span>
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
                    strokeDasharray="78, 100"
                  />
                </svg>
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  Based on last 50 interviews
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
                <span className="text-sm font-bold">124</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Screening</span>
                <span className="text-sm font-bold">86</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Interview</span>
                <span className="text-sm font-bold">45</span>
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
                <span className="text-sm font-bold">8</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  Mail,
  CheckCircle,
  AlertCircle,
  Info,
} from "lucide-react";
import InterviewService from "../../services/InterviewService"; // Import the service

const InterviewScheduler = () => {
  // Form state
  const [formData, setFormData] = useState({
    resume_id: "",
    job_id: 1, // Default job ID
    date: "",
    time: "",
    duration: 60,
    location: "",
    meeting_link: "",
    notes: "",
    interviewers: [],
    sendNotifications: true
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [loadingInterviews, setLoadingInterviews] = useState(false);

  // Sample data (replace with API calls to fetch real data)
  const candidates = [
    { id: 1, resume_id: 1, name: "John Doe", position: "Software Engineer" },
    { id: 2, resume_id: 2, name: "Jane Smith", position: "Product Manager" }
  ];

  const interviewersList = [
    { id: 1, name: "Sarah Smith", role: "Tech Lead" },
    { id: 2, name: "Mike Johnson", role: "Senior Developer" },
    { id: 3, name: "Alex Brown", role: "Product Manager" },
    { id: 4, name: "Lisa Chen", role: "HR Manager" }
  ];

  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", 
    "16:00", "16:30", "17:00"
  ];

  // Fetch interviews when component mounts
  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    setLoadingInterviews(true);
    try {
      console.log("Fetching interviews...");
      const response = await InterviewService.listInterviews();
      console.log("Response received:", response);
      
      // Check if response.data is an array
      if (Array.isArray(response.data)) {
        setInterviews(response.data);
      } else if (response.data && Array.isArray(response.data.data)) {
        // Some APIs wrap the data in a data property
        setInterviews(response.data.data);
      } else {
        console.error("Unexpected response format:", response.data);
        setInterviews([]);
      }
    } catch (error) {
      console.error("Failed to fetch interviews:", error);
      
      // Enhanced error logging
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        console.error("Error response headers:", error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.error("Error request:", error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error message:", error.message);
      }
      
      setError("Failed to load interviews. Please try again.");
      setInterviews([]); // Set empty array on error to prevent undefined errors
    } finally {
      setLoadingInterviews(false);
    }
};

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle interviewer selection (multi-select)
  const handleInterviewerChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => parseInt(option.value));
    
    // Map selected IDs to the format expected by the backend
    const formattedInterviewers = selectedOptions.map(id => {
      const interviewer = interviewersList.find(i => i.id === id);
      return {
        user_id: id,
        role: interviewer ? interviewer.role : "Interviewer"
      };
    });

    setFormData({ ...formData, interviewers: formattedInterviewers });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.resume_id || !formData.date || !formData.time) {
        throw new Error("Please fill in all required fields");
      }

      if (formData.interviewers.length === 0) {
        throw new Error("Please select at least one interviewer");
      }

      // Ensure values are in the correct format
      const interviewData = {
        ...formData,
        job_id: parseInt(formData.job_id),
        resume_id: parseInt(formData.resume_id),
        duration: parseInt(formData.duration)
      };

      console.log("Sending interview data:", interviewData);
      const response = await InterviewService.scheduleInterview(interviewData);
      console.log("Schedule response:", response);
      
      // Success - reset form and refresh interviews
      alert("Interview scheduled successfully!");
      setFormData({
        resume_id: "",
        job_id: 1,
        date: "",
        time: "",
        duration: 60,
        location: "",
        meeting_link: "",
        notes: "",
        interviewers: [],
        sendNotifications: true
      });
      
      fetchInterviews();
    } catch (error) {
      console.error("Error scheduling interview:", error);
      
      // Enhanced error logging
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
      }
      
      setError(error.response?.data?.message || error.message || "Failed to schedule interview");
    } finally {
      setLoading(false);
    }
};

  // Handle sending reminder
  const handleSendReminder = async (interviewId) => {
    // This would be implemented based on your backend functionality
    alert(`Sending reminder for interview ${interviewId}`);
  };

  // Handle confirming interview
  const handleConfirmInterview = async (interviewId) => {
    try {
      await InterviewService.updateInterview(interviewId, {
        status: "confirmed",
        sendNotifications: true
      });
      
      // Refresh interviews after update
      fetchInterviews();
      alert("Interview confirmed successfully");
    } catch (error) {
      console.error("Error confirming interview:", error);
      alert("Failed to confirm interview");
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-12 gap-6">
        {/* Calendar View */}
        <div className="col-span-8">
          <Card>
            <CardHeader>
              <CardTitle>Interview Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingInterviews ? (
                <div className="text-center py-10">Loading interviews...</div>
              ) : (
                <div className="grid grid-cols-7 gap-4">
                  {/* Calendar header */}
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (day) => (
                      <div
                        key={day}
                        className="text-center font-semibold text-gray-600"
                      >
                        {day}
                      </div>
                    )
                  )}

                  {/* Calendar days */}
                  {Array.from({ length: 35 }).map((_, index) => {
                    // Generate the date for this calendar cell
                    const today = new Date();
                    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                    const dayOffset = firstDay.getDay(); // 0 = Sunday
                    const displayDate = new Date(today.getFullYear(), today.getMonth(), index - dayOffset + 1);
                    const formattedDate = `${displayDate.getFullYear()}-${String(displayDate.getMonth() + 1).padStart(2, '0')}-${String(displayDate.getDate()).padStart(2, '0')}`;

                    // Filter interviews for this date
                    // const dayInterviews = interviews.filter(interview => interview.date === formattedDate);
                    // Filter interviews for this date
                    const dayInterviews = interviews.filter(interview => {
                      // Safety check for missing date
                      if (!interview.date) return false;
                      
                      // Parse the interview date
                      const interviewDate = new Date(interview.date);
                      interviewDate.setHours(0, 0, 0, 0); // Start of interview day
                      
                      // Parse the formatted date for comparison
                      const targetDate = new Date(formattedDate);
                      targetDate.setHours(0, 0, 0, 0);
                      
                      // Compare dates using timestamp comparison (more reliable)
                      return interviewDate.getTime() === targetDate.getTime();
                    });
                    
                    return (
                      <div
                        key={index}
                        className={`aspect-square border rounded-lg p-2 cursor-pointer hover:bg-gray-50 ${
                          displayDate.getMonth() !== today.getMonth() ? 'opacity-40' : ''
                        }`}
                      >
                        <div className="text-sm">{displayDate.getDate()}</div>
                        {/* Interview indicators */}
                        <div className="mt-1 space-y-1">
                          {dayInterviews.map((interview) => (
                            <div
                              key={interview.id}
                              className={`text-xs px-1 py-0.5 rounded ${
                                interview.status === "confirmed"
                                  ? "bg-green-100 text-green-800"
                                  : interview.status === "cancelled"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {interview.time.substring(0, 5)}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Interview Details */}
        <div className="col-span-4">
          <Card>
            <CardHeader>
              <CardTitle>Schedule Interview</CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md flex items-start">
                  <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
              
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="text-sm font-medium">Candidate (Resume ID)</label>
                  <select 
                    name="resume_id"
                    value={formData.resume_id}
                    onChange={handleInputChange}
                    className="w-full mt-1 p-2 border rounded-md"
                    required
                  >
                    <option value="">Select Candidate</option>
                    {candidates.map(candidate => (
                      <option key={candidate.id} value={candidate.resume_id}>
                        {candidate.name} - {candidate.position}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Job ID</label>
                  <input
                    type="number"
                    name="job_id"
                    value={formData.job_id}
                    onChange={handleInputChange}
                    className="w-full mt-1 p-2 border rounded-md"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Date</label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="pl-10 w-full p-2 border rounded-md"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Time Slot</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <select 
                      name="time"
                      value={formData.time}
                      onChange={handleInputChange}
                      className="pl-10 w-full p-2 border rounded-md"
                      required
                    >
                      <option value="">Select Time</option>
                      {timeSlots.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Duration (minutes)
                  </label>
                  <select 
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    className="w-full mt-1 p-2 border rounded-md"
                  >
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="90">1.5 hours</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g., Conference Room A or Virtual"
                    className="w-full mt-1 p-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Meeting Link</label>
                  <input
                    type="text"
                    name="meeting_link"
                    value={formData.meeting_link}
                    onChange={handleInputChange}
                    placeholder="e.g., https://meet.example.com/abc123"
                    className="w-full mt-1 p-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Any additional information for the interview"
                    className="w-full mt-1 p-2 border rounded-md"
                    rows="2"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Interviewers</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <select
                      multiple
                      onChange={handleInterviewerChange}
                      className="pl-10 w-full p-2 border rounded-md h-32"
                      required
                    >
                      {interviewersList.map((interviewer) => (
                        <option key={interviewer.id} value={interviewer.id}>
                          {interviewer.name} - {interviewer.role}
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    <Info className="inline-block w-3 h-3 mr-1" />
                    Hold Ctrl (or Cmd) to select multiple interviewers
                  </p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full p-2 py-[13px] bg-blue-500 hover:bg-blue-600"
                  disabled={loading}
                >
                  {loading ? "Scheduling..." : "Schedule Interview"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Today's Interviews */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Today's Interviews</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingInterviews ? (
                <div className="text-center py-5">Loading interviews...</div>
              ) : interviews.length === 0 ? (
                <div className="text-center py-5 text-gray-500">No interviews scheduled for today</div>
              ) : (
                <div className="space-y-4">
                  {interviews
                    .filter(interview => {
                      // Filter for today's interviews
                      const today = new Date();
                      const interviewDate = new Date(interview.date);
                      return (
                        interviewDate.getDate() === today.getDate() &&
                        interviewDate.getMonth() === today.getMonth() &&
                        interviewDate.getFullYear() === today.getFullYear()
                      );
                    })
                    .map((interview) => (
                      <div
                        key={interview.id}
                        className="border rounded-lg p-4 space-y-2"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">
                              {interview.resume?.candidate?.name || "Unknown Candidate"}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {interview.job?.title || "Unknown Position"}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              interview.status === "confirmed"
                                ? "bg-green-100 text-green-800"
                                : interview.status === "cancelled"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {interview.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2" />
                            {interview.time?.substring(0, 5) || "N/A"} ({interview.duration || 60} mins)
                          </div>
                          <div className="flex items-center mt-1">
                            <Users className="w-4 h-4 mr-2" />
                            {interview.participants?.length > 0 
                              ? interview.participants.map(p => p.user?.name).join(", ")
                              : "No interviewers assigned"}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 hover:underline underline-offset-2"
                            onClick={() => handleSendReminder(interview.id)}
                          >
                            <Mail className="w-4 h-4 mr-2" />
                            Send Reminder
                          </Button>
                          {interview.status === "pending" && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1 hover:text-gray-400"
                              onClick={() => handleConfirmInterview(interview.id)}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Confirm
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InterviewScheduler;
import React, { useState } from "react";
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
} from "lucide-react";

const InterviewScheduler = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [interviews, setInterviews] = useState([
    {
      id: 1,
      candidateName: "John Doe",
      position: "Senior Software Engineer",
      date: "2024-01-28",
      time: "10:00",
      duration: 60,
      status: "confirmed",
      interviewers: ["Sarah Smith", "Mike Johnson"],
    },
    {
      id: 2,
      candidateName: "Jane Smith",
      position: "Product Manager",
      date: "2024-01-28",
      time: "14:00",
      duration: 45,
      status: "pending",
      interviewers: ["Alex Brown"],
    },
  ]);

  const timeSlots = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
  ];

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
                {Array.from({ length: 35 }).map((_, index) => (
                  <div
                    key={index}
                    className="aspect-square border rounded-lg p-2 cursor-pointer hover:bg-gray-50"
                  >
                    <div className="text-sm">{index + 1}</div>
                    {/* Interview indicators */}
                    <div className="mt-1 space-y-1">
                      {interviews
                        .filter(
                          (interview) =>
                            interview.date === `2024-01-${index + 1}`
                        )
                        .map((interview) => (
                          <div
                            key={interview.id}
                            className={`text-xs px-1 py-0.5 rounded ${
                              interview.status === "confirmed"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {interview.time}
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
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
              <form className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Candidate</label>
                  <select className="w-full mt-1 p-2 border rounded-md">
                    <option value="">Select Candidate</option>
                    <option value="1">John Doe - Software Engineer</option>
                    <option value="2">Jane Smith - Product Manager</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Date</label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="date"
                      className="pl-10 w-full p-2 border rounded-md"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Time Slot</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <select className="pl-10 w-full p-2 border rounded-md">
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
                  <select className="w-full mt-1 p-2 border rounded-md">
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="90">1.5 hours</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Interviewers</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <select
                      multiple
                      className="pl-10 w-full p-2 border rounded-md h-32"
                    >
                      <option value="1">Sarah Smith - Tech Lead</option>
                      <option value="2">Mike Johnson - Senior Developer</option>
                      <option value="3">Alex Brown - Product Manager</option>
                      <option value="4">Lisa Chen - HR Manager</option>
                    </select>
                  </div>
                </div>

                <Button className="w-full p-2 py-[13px] bg-blue-500 hover:bg-blue-600">
                  Schedule Interview
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
              <div className="space-y-4">
                {interviews.map((interview) => (
                  <div
                    key={interview.id}
                    className="border rounded-lg p-4 space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">
                          {interview.candidateName}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {interview.position}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          interview.status === "confirmed"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {interview.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        {interview.time} ({interview.duration} mins)
                      </div>
                      <div className="flex items-center mt-1">
                        <Users className="w-4 h-4 mr-2" />
                        {interview.interviewers.join(", ")}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="flex-1 hover:underline underline-offset-2">
                        <Mail className="w-4 h-4 mr-2" />
                        Send Reminder
                      </Button>
                      {interview.status === "pending" && (
                        <Button variant="outline" size="sm" className="flex-1 hover:text-gray-400">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Confirm
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InterviewScheduler;

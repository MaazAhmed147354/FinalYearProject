import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  FileText,
  CheckCircle,
  XCircle,
  Eye,
  MessageSquare,
  Star,
  Filter,
  Download,
} from "lucide-react";
import React, { useState } from "react";

const ManageResumes = () => {
  const [resumes, setResumes] = useState([
    {
      id: 1,
      candidateName: "John Doe",
      email: "john@example.com",
      jobTitle: "Senior Software Engineer",
      submissionDate: "2024-01-25",
      matchScore: 85,
      status: "shortlisted",
      skills: ["React", "Node.js", "Python"],
      experience: "5 years",
    },
    // Add more sample resumes
  ]);

  const [filterCriteria, setFilterCriteria] = useState({
    status: "all",
    minScore: 0,
  });

  return (
    <div className="p-6">
      <div className="grid grid-cols-4 gap-6">
        {/* Filters and Actions */}
        <div className="col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <select
                    value={filterCriteria.status}
                    onChange={(e) =>
                      setFilterCriteria({
                        ...filterCriteria,
                        status: e.target.value,
                      })
                    }
                    className="w-full mt-1 p-2 border rounded-md"
                  >
                    <option value="all">All</option>
                    <option value="pending">Pending</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Minimum Match Score
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={filterCriteria.minScore}
                    onChange={(e) =>
                      setFilterCriteria({
                        ...filterCriteria,
                        minScore: e.target.value,
                      })
                    }
                    className="w-full mt-1"
                  />
                  <div className="text-sm text-gray-500 text-center">
                    {filterCriteria.minScore}%
                  </div>
                </div>

                <Button className="w-full" variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Apply Filters
                </Button>

                <Button className="w-full" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export Selected
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resume List */}
        <div className="col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Resume Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {resumes.map((resume) => (
                  <div
                    key={resume.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {resume.candidateName}
                        </h3>
                        <p className="text-sm text-gray-500">{resume.email}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            resume.status === "shortlisted"
                              ? "bg-green-100 text-green-800"
                              : resume.status === "rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {resume.status}
                        </span>
                        <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                          {resume.matchScore}% Match
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-sm">
                        <strong>Applied for:</strong> {resume.jobTitle}
                      </p>
                      <p className="text-sm">
                        <strong>Experience:</strong> {resume.experience}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {resume.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-600"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Shortlist
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                      <Button variant="outline" size="sm">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Add Note
                      </Button>
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

export default ManageResumes;

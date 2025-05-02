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
  FileOutput,
  ClipboardList
} from "lucide-react";
import React, { useState } from "react";

// Report Generation Modal
const ReportModal = ({ isOpen, onClose, candidateName, reportData }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Candidate Report: {candidateName}</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <XCircle className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg">Match Score Analysis</h3>
            <div className="mt-2 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Overall Match</span>
                <span className="text-sm font-medium">{reportData.matchScore}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${reportData.matchScore}%` }}
                ></div>
              </div>
              
              <div className="mt-4">
                <h4 className="font-medium">Skills Match</h4>
                <div className="mt-2 space-y-2">
                  {reportData.skills.map((skill, index) => (
                    <div key={index} className="flex justify-between">
                      <span className="text-sm">{skill.name}</span>
                      <span className={`text-sm ${skill.match ? 'text-green-600' : 'text-red-600'}`}>
                        {skill.match ? 'Match' : 'Missing'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-4">
                <h4 className="font-medium">Experience</h4>
                <p className="text-sm">
                  Required: {reportData.requiredExperience} years | 
                  Candidate: {reportData.candidateExperience} years
                </p>
                <div className="flex justify-between mb-1 mt-2">
                  <span className="text-sm">Experience Match</span>
                  <span className="text-sm">{reportData.experienceScore}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${reportData.experienceScore}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg">Areas for Improvement</h3>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-gray-600">
              {reportData.improvements.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download Report
            </Button>
            <Button className="bg-blue-500 hover:bg-blue-600" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

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
      reportData: {
        matchScore: 85,
        skills: [
          { name: "React", match: true },
          { name: "Node.js", match: true },
          { name: "Python", match: true },
          { name: "TypeScript", match: false },
          { name: "AWS", match: false }
        ],
        requiredExperience: 5,
        candidateExperience: 5,
        experienceScore: 100,
        improvements: [
          "Missing key skill: TypeScript",
          "Missing experience with AWS",
          "Could improve on leadership experience"
        ]
      }
    },
    {
      id: 2,
      candidateName: "Jane Smith",
      email: "jane@example.com",
      jobTitle: "Product Manager",
      submissionDate: "2024-01-26",
      matchScore: 72,
      status: "pending",
      skills: ["Product Strategy", "User Research", "Agile"],
      experience: "3 years",
      reportData: {
        matchScore: 72,
        skills: [
          { name: "Product Strategy", match: true },
          { name: "User Research", match: true },
          { name: "Agile", match: true },
          { name: "Data Analysis", match: false }
        ],
        requiredExperience: 4,
        candidateExperience: 3,
        experienceScore: 75,
        improvements: [
          "Below required years of experience",
          "Missing skill: Data Analysis",
          "Limited experience with enterprise products"
        ]
      }
    },
    {
      id: 3,
      candidateName: "Michael Johnson",
      email: "michael@example.com",
      jobTitle: "UX Designer",
      submissionDate: "2024-01-24",
      matchScore: 78,
      status: "shortlisted",
      skills: ["Figma", "User Testing", "Wireframing"],
      experience: "4 years",
      reportData: {
        matchScore: 78,
        skills: [
          { name: "Figma", match: true },
          { name: "User Testing", match: true },
          { name: "Wireframing", match: true },
          { name: "Adobe XD", match: false }
        ],
        requiredExperience: 3,
        candidateExperience: 4,
        experienceScore: 100,
        improvements: [
          "Missing experience with Adobe XD",
          "Limited portfolio of mobile applications"
        ]
      }
    }
  ]);

  const [filterCriteria, setFilterCriteria] = useState({
    status: "all",
    minScore: 0,
  });

  const [reportModal, setReportModal] = useState({
    isOpen: false,
    candidateName: "",
    reportData: null
  });

  const openReportModal = (candidateName, reportData) => {
    setReportModal({
      isOpen: true,
      candidateName,
      reportData
    });
  };

  const closeReportModal = () => {
    setReportModal({
      isOpen: false,
      candidateName: "",
      reportData: null
    });
  };

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
                <Button className="w-full hover:text-gray-400" variant="outline">
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
                      <Button className="hover:text-gray-400" variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-blue-600 hover:text-blue-400"
                        onClick={() => openReportModal(resume.candidateName, resume.reportData)}
                      >
                        <ClipboardList className="w-4 h-4 mr-1" />
                        Generate Report
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-600 hover:text-green-400"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Shortlist
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-400"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                      <Button className="hover:text-gray-400" variant="outline" size="sm">
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

      {/* Report Modal */}
      <ReportModal 
        isOpen={reportModal.isOpen}
        onClose={closeReportModal}
        candidateName={reportModal.candidateName}
        reportData={reportModal.reportData}
      />
    </div>
  );
};

export default ManageResumes;

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
  X,
  Eye,
  MessageSquare,
  Star,
  Filter,
  Download,
  FileOutput,
  ClipboardList,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import ReportService from "../../services/ReportService";
import ResumeService from "../../services/ResumeService";
import JobService from "../../services/JobService";
import Select from "react-select";
import EmailService from "../../services/EmailService";

// Report Generation Modal
const ReportModal = ({
  isOpen,
  onClose,
  candidateName,
  reportData,
  isLoading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-400 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            Candidate Report: {candidateName}
          </h2>
          <Button
            className="hover:bg-gray-300 rounded-4xl p-1"
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : reportData ? (
          <div className="space-y-4" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
            <div>
              <h3 className="font-semibold text-lg">Match Score Analysis</h3>
              <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Overall Match</span>
                  <span className="text-sm font-medium">
                    {reportData.matchScore}%
                  </span>
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
                        <span
                          className={`text-sm ${
                            skill.match ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {skill.match ? "Match" : "Missing"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="font-medium">Experience</h4>
                  <p className="text-sm">
                    Required: {reportData.requiredExperience} years | Candidate:{" "}
                    {reportData.candidateExperience} years
                  </p>
                  <div className="flex justify-between mb-1 mt-2">
                    <span className="text-sm">Experience Match</span>
                    <span className="text-sm">
                      {reportData.experienceScore}%
                    </span>
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

            {reportData.recommendation && (
              <div>
                <h3 className="font-semibold text-lg">Recommendation</h3>
                <p className="text-sm text-gray-600">
                  {reportData.recommendation}
                </p>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <Button className="hover:bg-gray-300 p-2" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center p-8">
            <p className="text-gray-600">Failed to load report data</p>
          </div>
        )}
      </div>
    </div>
  );
};

const ManageResumes = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filterCriteria, setFilterCriteria] = useState({
    status: "all",
    minScore: 0,
  });

  const [reportModal, setReportModal] = useState({
    isOpen: false,
    candidateName: "",
    reportData: null,
    isLoading: false,
  });

  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);

  // Fetch resumes when component mounts
  useEffect(() => {
    fetchResumes();
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await JobService.listJobs();
      if (response.data && response.data.data) {
        setJobs(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    }
  };

  const fetchResumes = async () => {
    try {
      setLoading(true);
      const response = await ResumeService.listResumes();
      setResumes(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching resumes:", err);
      setError("Failed to load resumes");
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (resumeId, candidateName) => {
    setReportModal({
      isOpen: true,
      candidateName,
      reportData: null,
      isLoading: true,
    });

    try {
      // Get the current logged in user ID - you'll need to implement a way to get this
      // For example, from a user context or localStorage
      const userId = 1; // Replace with actual user ID retrieval

      const response = await ReportService.generateCandidateReport(resumeId);

      // The API returns the report with the content field containing the JSON report data
      const reportData = response.data.data.content;

      setReportModal((prev) => ({
        ...prev,
        reportData,
        isLoading: false,
      }));
    } catch (error) {
      console.error("Error generating report:", error);
      setReportModal((prev) => ({
        ...prev,
        reportData: null,
        isLoading: false,
      }));
    }
  };

  const closeReportModal = () => {
    setReportModal({
      isOpen: false,
      candidateName: "",
      reportData: null,
      isLoading: false,
    });
  };

  const handleExtractResumes = async () => {
    if (!selectedJob) {
      alert("Please select a job title first.");
      return;
    }

    const jobId = selectedJob.value;

    try {
      // Call the new backend endpoint to trigger the process
      await EmailService.extractResumesFromJob(jobId); // Ensure this function exists in EmailService

      // Assuming a service method exists to fetch resume IDs by job ID
      const resumeResponse = await ResumeService.getResumeIdsByJobId(jobId);
      const resumeIds = resumeResponse.data.data.map((resume) => resume.id);

      // Generate Report for each resume ID
      const userId = 1; // Default user_id as specified
      for (const resumeId of resumeIds) {
        try {
          await ReportService.generateCandidateReport(resumeId, userId);
          console.log(
            `Successfully generated report for resume ID: ${resumeId}`
          );
        } catch (error) {
          console.error(
            `Failed to generate report for resume ID: ${resumeId}`,
            error
          );
        }
      }

      alert("Resume extraction and report generation process initiated.");
    } catch (error) {
      console.error("Error during extraction:", error);
      alert("An error occurred during the extraction process.");
    }
  };

  // Apply filters to resumes
  const filteredResumes = resumes.filter((resume) => {
    if (
      filterCriteria.status !== "all" &&
      resume.status !== filterCriteria.status
    ) {
      return false;
    }
    if (resume.matchScore < filterCriteria.minScore) {
      return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-500 mb-4">{error}</div>
        <Button variant="outline" onClick={fetchResumes}>
          Retry
        </Button>
      </div>
    );
  }

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
                <Button
                  className="w-full hover:text-gray-400"
                  variant="outline"
                >
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
              <div className="flex justify-between items-center">
                <CardTitle>Resume Management</CardTitle>
                <div className="flex gap-4 items-center">
                  <div style={{ minWidth: "200px" }}>
                    <Select
                      options={jobs.map((job) => ({
                        value: job.id,
                        label: job.title,
                      }))}
                      onChange={setSelectedJob}
                      placeholder="Select Job Title"
                      isClearable={true}
                    />
                  </div>
                  <Button 
                    onClick={handleExtractResumes}
                    className="transition-colors duration-200 bg-blue-600 text-white hover:bg-blue-700 hover:text-whit p-2"
                  >
                    Extract Resumes
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredResumes.length === 0 ? (
                  <div className="text-center p-8 text-gray-500">
                    No resumes match your criteria
                  </div>
                ) : (
                  filteredResumes.map((resume) => (
                    <div
                      key={resume.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold">
                            {resume.candidate?.name || "Unknown Candidate"}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {resume.candidate?.email || "No email"}
                          </p>
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
                          {resume.scores && resume.scores.length > 0 && (
                            <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                              {resume.scores[0].total_score}% Match
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-4">
                        <p className="text-sm">
                          <strong>Applied for:</strong>{" "}
                          {resume.job?.title || "Not specified"}
                        </p>
                        <p className="text-sm">
                          <strong>Experience:</strong>{" "}
                          {resume.experience_years || 0} years
                        </p>
                      </div>

                      <div className="mt-4 flex justify-end space-x-2">
                        <Button
                          className="hover:text-gray-400"
                          variant="outline"
                          size="sm"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-blue-600 hover:text-blue-400"
                          onClick={async () => {
                            setReportModal({
                              isOpen: true,
                              candidateName: resume.candidate?.name || "Candidate",
                              reportData: null,
                              isLoading: true,
                            });
                            try {
                              const response = await ReportService.generateCandidateReport(resume.id, 1);
                              const reportData = response.data.data.content;
                              setReportModal((prev) => ({
                                ...prev,
                                reportData,
                                isLoading: false,
                              }));
                            } catch (error) {
                              setReportModal((prev) => ({
                                ...prev,
                                reportData: null,
                                isLoading: false,
                              }));
                              alert("Failed to generate report");
                            }
                          }}
                        >
                          <ClipboardList className="w-4 h-4 mr-1" />
                          Generate Report
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600 hover:text-green-400"
                          onClick={async () => {
                            try {
                              await ResumeService.updateResumeStatus(
                                resume.id,
                                "shortlisted"
                              );
                              setResumes((prev) =>
                                prev.map((r) =>
                                  r.id === resume.id
                                    ? { ...r, status: "shortlisted" }
                                    : r
                                )
                              );
                            } catch (err) {
                              alert("Failed to shortlist resume");
                            }
                          }}
                          disabled={resume.status === 'rejected'}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Shortlist
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-400"
                          onClick={async () => {
                            try {
                              await ResumeService.updateResumeStatus(
                                resume.id,
                                "rejected"
                              );
                              setResumes((prev) =>
                                prev.map((r) =>
                                  r.id === resume.id
                                    ? { ...r, status: "rejected" }
                                    : r
                                )
                              );
                            } catch (err) {
                              alert("Failed to reject resume");
                            }
                          }}
                          disabled={resume.status === 'rejected'}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                        <Button
                          className="hover:text-gray-400"
                          variant="outline"
                          size="sm"
                        >
                          <MessageSquare className="w-4 h-4 mr-1" />
                          Add Note
                        </Button>
                      </div>
                    </div>
                  ))
                )}
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
        isLoading={reportModal.isLoading}
      />
    </div>
  );
};

export default ManageResumes;

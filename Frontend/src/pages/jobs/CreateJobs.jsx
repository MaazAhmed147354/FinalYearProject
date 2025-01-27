import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Briefcase,
  Calendar,
  Clock,
  BookOpen,
  GraduationCap,
  Code,
} from "lucide-react";
import React, { useState } from "react";

const CreateJob = () => {
  const [jobData, setJobData] = useState({
    title: "",
    description: "",
    requiredSkills: "",
    qualifications: "",
    experience: "",
    startDate: "",
    endDate: "",
    department: "",
    jobType: "full-time",
    location: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle job creation logic
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-3 gap-6">
        {/* Job Creation Form */}
        <div className="col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Create New Job Opening</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Job Title</label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={jobData.title}
                        onChange={(e) =>
                          setJobData({ ...jobData, title: e.target.value })
                        }
                        className="pl-10 w-full p-2 border rounded-md"
                        placeholder="Enter job title"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Department</label>
                    <div className="relative">
                      <BookOpen className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <select
                        value={jobData.department}
                        onChange={(e) =>
                          setJobData({ ...jobData, department: e.target.value })
                        }
                        className="pl-10 w-full p-2 border rounded-md"
                      >
                        <option value="">Select Department</option>
                        <option value="engineering">Engineering</option>
                        <option value="product">Product</option>
                        <option value="design">Design</option>
                        <option value="marketing">Marketing</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Job Description</label>
                  <textarea
                    value={jobData.description}
                    onChange={(e) =>
                      setJobData({ ...jobData, description: e.target.value })
                    }
                    className="w-full p-2 border rounded-md"
                    rows="4"
                    placeholder="Enter detailed job description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Required Skills
                    </label>
                    <div className="relative">
                      <Code className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <textarea
                        value={jobData.requiredSkills}
                        onChange={(e) =>
                          setJobData({
                            ...jobData,
                            requiredSkills: e.target.value,
                          })
                        }
                        className="pl-10 w-full p-2 border rounded-md"
                        rows="3"
                        placeholder="Enter required skills"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Qualifications
                    </label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <textarea
                        value={jobData.qualifications}
                        onChange={(e) =>
                          setJobData({
                            ...jobData,
                            qualifications: e.target.value,
                          })
                        }
                        className="pl-10 w-full p-2 border rounded-md"
                        rows="3"
                        placeholder="Enter required qualifications"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Start Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input
                        type="date"
                        value={jobData.startDate}
                        onChange={(e) =>
                          setJobData({ ...jobData, startDate: e.target.value })
                        }
                        className="pl-10 w-full p-2 border rounded-md"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">End Date</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input
                        type="date"
                        value={jobData.endDate}
                        onChange={(e) =>
                          setJobData({ ...jobData, endDate: e.target.value })
                        }
                        className="pl-10 w-full p-2 border rounded-md"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    Create Job Opening
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Preview Panel */}
        <div className="col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Job Post Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <h3 className="text-xl font-bold">
                  {jobData.title || "Job Title"}
                </h3>
                <div className="text-sm text-gray-600">
                  <p>
                    <strong>Department:</strong>{" "}
                    {jobData.department || "Not specified"}
                  </p>
                  <p>
                    <strong>Location:</strong>{" "}
                    {jobData.location || "Not specified"}
                  </p>
                  <p>
                    <strong>Job Type:</strong> {jobData.jobType}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-sm text-gray-600">
                    {jobData.description || "No description provided"}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Required Skills</h4>
                  <p className="text-sm text-gray-600">
                    {jobData.requiredSkills || "No skills specified"}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Qualifications</h4>
                  <p className="text-sm text-gray-600">
                    {jobData.qualifications || "No qualifications specified"}
                  </p>
                </div>
                <div className="text-sm text-gray-600">
                  <p>
                    <strong>Application Period:</strong>
                  </p>
                  <p>
                    {jobData.startDate} - {jobData.endDate}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateJob;

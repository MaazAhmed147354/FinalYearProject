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
  ChevronRight,
  ChevronLeft,
  Save,
  X,
  Plus,
  FileText,
  User,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import JobService from "../../services/JobService";
import CriteriaService from "../../services/CriteriaService";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const CreateJobWithCriteria = () => {
  const navigate = useNavigate();
  const { user, getUserId } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [activeUserId, setActiveUserId] = useState(null);
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

  // Get active user ID on component mount
  useEffect(() => {
    const userId = getUserId();
    setActiveUserId(userId);
    console.log("Active user ID from AuthContext:", userId);
  }, [getUserId]);

  const [criteria, setCriteria] = useState({
    name: "",
    skills: [
      { name: "", weight: 30, mandatory: true },
    ],
    experience: {
      minYears: 0,
      weight: 25,
    },
    keywords: [],
  });

  const [createdJobId, setCreatedJobId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [keywordInput, setKeywordInput] = useState("");

  const handleJobDataChange = (e) => {
    const { name, value } = e.target;
    setJobData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddSkill = () => {
    setCriteria((prev) => ({
      ...prev,
      skills: [
        ...prev.skills,
        { name: "", weight: 30, mandatory: false },
      ],
    }));
  };

  const handleSkillChange = (index, field, value) => {
    setCriteria((prev) => {
      const newSkills = [...prev.skills];
      newSkills[index] = {
        ...newSkills[index],
        [field]: value,
      };
      return {
        ...prev,
        skills: newSkills,
      };
    });
  };

  const handleRemoveSkill = (index) => {
    setCriteria((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  };

  const handleAddKeyword = (keyword) => {
    if (keyword && !criteria.keywords.includes(keyword)) {
      setCriteria((prev) => ({
        ...prev,
        keywords: [...prev.keywords, keyword],
      }));
      setKeywordInput("");
    }
  };

  const handleRemoveKeyword = (keyword) => {
    setCriteria((prev) => ({
      ...prev,
      keywords: prev.keywords.filter((k) => k !== keyword),
    }));
  };

  const handleCreateJob = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate required fields
      if (!jobData.title || !jobData.description || !jobData.department || !jobData.endDate) {
        setError("Please fill in all required fields");
        setLoading(false);
        return;
      }

      // Create job
      const response = await JobService.createJob(
        jobData.title,
        jobData.description,
        jobData.department,
        jobData.endDate,
        jobData.requiredSkills,
        jobData.qualifications,
        jobData.experience
      );

      console.log("Job creation response:", response);

      // Extract the job ID from the response
      // The API returns { success, message, data: { id, ... } }
      if (response.data && response.data.data && response.data.data.id) {
        // Store the created job ID
        setCreatedJobId(response.data.data.id);
        console.log("Job created successfully with ID:", response.data.data.id);
        
        // Move to next step
        setCurrentStep(2);
      } else {
        throw new Error("Failed to get job ID from response");
      }
    } catch (err) {
      console.error("Error creating job:", err);
      setError(err.response?.data?.message || err.message || "Error creating job");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCriteria = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate criteria
      if (!createdJobId) {
        setError("Job ID is missing. Please try again.");
        setLoading(false);
        return;
      }

      console.log("Submitting criteria for job ID:", createdJobId);

      // Filter out empty skills
      const validSkills = criteria.skills.filter(skill => skill.name.trim() !== "");
      
      if (validSkills.length === 0) {
        setError("Please add at least one skill");
        setLoading(false);
        return;
      }

      // Add any pending keyword from the input field
      let finalKeywords = [...criteria.keywords];
      if (keywordInput.trim()) {
        finalKeywords.push(keywordInput.trim());
      }

      // Create criteria for the job
      const response = await CriteriaService.createCriteria(
        createdJobId,
        criteria.name || jobData.title + " Criteria",
        criteria.experience.weight,
        criteria.experience.minYears,
        validSkills,
        finalKeywords
      );

      console.log("Criteria creation response:", response);

      // Reset form state
      setShowForm(false);
      setCurrentStep(1);
      
      // Show success message
      alert("Job and criteria created successfully!");
      
      // Navigate to dashboard or job list
      navigate("/dashboard");
    } catch (err) {
      console.error("Error creating criteria:", err);
      setError(err.response?.data?.message || err.message || "Error creating criteria");
    } finally {
      setLoading(false);
    }
  };

  const renderStepOne = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Job Title</label>
          <div className="relative">
            <Briefcase className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              name="title"
              value={jobData.title}
              onChange={handleJobDataChange}
              className="pl-10 w-full p-2 border rounded-md"
              placeholder="Enter job title"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Department</label>
          <div className="relative">
            <BookOpen className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <select
              name="department"
              value={jobData.department}
              onChange={handleJobDataChange}
              className="pl-10 w-full p-2 border rounded-md"
              required
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
          name="description"
          value={jobData.description}
          onChange={handleJobDataChange}
          className="w-full p-2 border rounded-md"
          rows="4"
          placeholder="Enter detailed job description"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Required Skills</label>
        <div className="relative">
          <Code className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <textarea
            name="requiredSkills"
            value={jobData.requiredSkills}
            onChange={handleJobDataChange}
            className="pl-10 w-full p-2 border rounded-md"
            rows="2"
            placeholder="Enter required skills (comma-separated)"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Qualifications</label>
          <div className="relative">
            <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <textarea
              name="qualifications"
              value={jobData.qualifications}
              onChange={handleJobDataChange}
              className="pl-10 w-full p-2 border rounded-md"
              rows="2"
              placeholder="Enter required qualifications"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Experience</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              name="experience"
              value={jobData.experience}
              onChange={handleJobDataChange}
              className="pl-10 w-full p-2 border rounded-md"
              placeholder="E.g., 3-5 years"
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
              name="startDate"
              value={jobData.startDate}
              onChange={handleJobDataChange}
              className="pl-10 w-full p-2 border rounded-md"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">End Date</label>
          <div className="relative">
            <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="date"
              name="endDate"
              value={jobData.endDate}
              onChange={handleJobDataChange}
              className="pl-10 w-full p-2 border rounded-md"
              required
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          className="underline-offset-2 hover:underline"
          variant="outline"
          onClick={() => {
            setShowForm(false);
            setCurrentStep(1);
          }}
        >
          Cancel
        </Button>
        <Button
          type="button"
          className="bg-blue-500 hover:bg-blue-600 p-2 px-4"
          onClick={handleCreateJob}
          disabled={loading}
        >
          {loading ? "Creating..." : "Next"}
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  const renderStepTwo = () => (
    <div className="space-y-6">
      {/* Skills Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Required Skills</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddSkill}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Skill
          </Button>
        </div>
        <div className="space-y-4">
          {criteria.skills.map((skill, index) => (
            <div key={index} className="flex items-center space-x-4">
              <input
                type="text"
                value={skill.name}
                onChange={(e) =>
                  handleSkillChange(index, "name", e.target.value)
                }
                className="flex-1 p-2 border rounded-md"
                placeholder="Skill name"
              />
              <div className="flex-1">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={skill.weight}
                  onChange={(e) =>
                    handleSkillChange(index, "weight", parseInt(e.target.value))
                  }
                  className="w-full"
                />
                <div className="text-sm text-gray-500 text-center">
                  Weight: {skill.weight}%
                </div>
              </div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={skill.mandatory}
                  onChange={(e) =>
                    handleSkillChange(index, "mandatory", e.target.checked)
                  }
                  className="rounded"
                />
                <span className="text-sm">Mandatory</span>
              </label>
              {index > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveSkill(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Experience Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Experience Requirements</h3>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <label className="text-sm font-medium">Minimum Years</label>
            <input
              type="number"
              value={criteria.experience.minYears}
              onChange={(e) =>
                setCriteria((prev) => ({
                  ...prev,
                  experience: {
                    ...prev.experience,
                    minYears: parseInt(e.target.value),
                  },
                }))
              }
              className="w-full mt-1 p-2 border rounded-md"
              min="0"
            />
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium">Weight</label>
            <input
              type="range"
              min="0"
              max="100"
              value={criteria.experience.weight}
              onChange={(e) =>
                setCriteria((prev) => ({
                  ...prev,
                  experience: {
                    ...prev.experience,
                    weight: parseInt(e.target.value),
                  },
                }))
              }
              className="w-full mt-1"
            />
            <div className="text-sm text-gray-500 text-center">
              {criteria.experience.weight}%
            </div>
          </div>
        </div>
      </div>

      {/* Keywords Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Additional Keywords</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {criteria.keywords.map((keyword, index) => (
            <span
              key={index}
              className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm flex items-center"
            >
              {keyword}
              <button
                className="ml-2"
                onClick={() => handleRemoveKeyword(keyword)}
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            className="p-2 border rounded-md flex-1"
            placeholder="Add keyword"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddKeyword(keywordInput);
              }
            }}
          />
          <Button 
            type="button"
            onClick={() => handleAddKeyword(keywordInput)}
            className="bg-gray-200 hover:bg-gray-300 p-2"
          >
            Add
          </Button>
        </div>
      </div>

      <div className="flex justify-between space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => setCurrentStep(1)}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          type="button"
          className="bg-blue-500 hover:bg-blue-600 p-2 px-4"
          onClick={handleCreateCriteria}
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Job & Criteria"}
          <Save className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  const renderLandingPage = () => (
    <div className="flex flex-col items-center justify-center h-[80vh] text-center">
      <div className="mb-8">
        <div className="mb-4 flex justify-center">
          <Briefcase className="h-16 w-16 text-blue-500" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Create New Job Opening</h1>
        <p className="text-gray-500 max-w-md mx-auto">
          Set up a new job position and define the evaluation criteria for applicants in one streamlined process.
        </p>
      </div>
      
      <div className="space-y-4">
        <Button 
          size="lg" 
          className="bg-blue-500 hover:bg-blue-600 px-8 py-6 text-lg"
          onClick={() => setShowForm(true)}
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Job & Criteria
        </Button>
        
        <div>
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard")}
            className="mt-4 underline-offset-2 hover:underline hover:cursor-auto"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );

  const renderFormCard = () => (
    <Card>
      <CardHeader>
        <CardTitle>
          {currentStep === 1 ? "Create New Job Opening" : "Setup Evaluation Criteria"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === 1
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              1
            </div>
            <div className="w-16 h-1 bg-gray-200">
              <div
                className={`h-full bg-blue-500 transition-all duration-300 ${
                  currentStep === 2 ? "w-full" : "w-0"
                }`}
              />
            </div>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === 2
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              2
            </div>
          </div>
          <div className="flex justify-center mt-2">
            <span className="text-sm text-gray-500">
              {currentStep === 1 ? "Job Details" : "Evaluation Criteria"}
            </span>
          </div>
        </div>

        {currentStep === 1 ? renderStepOne() : renderStepTwo()}
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6">
      {showForm ? renderFormCard() : renderLandingPage()}
    </div>
  );
};

export default CreateJobWithCriteria; 
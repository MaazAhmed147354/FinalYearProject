import axios from "axios";

const BASE_API_URL = "http://localhost:3000/dev";

// Simple function to get user ID from localStorage
// This avoids circular dependency with AuthContext
const getUserId = () => {
  try {
    // Try to get from localStorage first
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user && user.id) {
        return user.id;
      }
    }
    
    // Default fallback
    return 3;
  } catch (error) {
    console.error("Error getting user ID:", error);
    return 3;
  }
};

class JobService {
  async createJob(title, description, department, deadline, requiredSkills = "", qualifications = "", experience = "") {
    // Get user ID
    const userId = getUserId();
    console.log("Creating job with user ID:", userId);
    
    return axios.post(
      BASE_API_URL + "/jobs/create",
      {
        title: title,
        description: description,
        department: department,
        required_skills: requiredSkills ? requiredSkills.split(",").map(skill => skill.trim()) : [],
        qualifications: qualifications,
        experience: experience,
        start_date: new Date().toISOString(),
        end_date: deadline,
        created_by: userId
      },
      {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  async listJobs(filters = {}) {
    let queryString = "";
    if (Object.keys(filters).length > 0) {
      queryString = "?" + new URLSearchParams(filters).toString();
    }
    
    return axios.get(BASE_API_URL + "/jobs/list" + queryString, {
      withCredentials: true,
    });
  }

  async getJobDetails(id) {
    return axios.get(BASE_API_URL + `/jobs/${id}`, {
      withCredentials: true,
    });
  }

  async updateJob(id, title, description, department, deadline, requiredSkills = "", qualifications = "", experience = "") {
    // Get user ID for logging purposes
    const userId = getUserId();
    console.log("Updating job with user ID:", userId);
    
    return axios.put(
      BASE_API_URL + `/jobs/${id}`,
      {
        title: title,
        description: description,
        department: department,
        required_skills: requiredSkills ? requiredSkills.split(",").map(skill => skill.trim()) : [],
        qualifications: qualifications,
        experience: experience,
        end_date: deadline
      },
      {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  async deleteJob(id) {
    return axios.delete(BASE_API_URL + `/jobs/${id}`, {
      withCredentials: true,
    });
  }

  async closeJob(id) {
    return axios.post(BASE_API_URL + `/jobs/${id}/close`, null, {
      withCredentials: true,
    });
  }

  async reopenJob(id) {
    return axios.post(BASE_API_URL + `/jobs/${id}/reopen`, null, {
      withCredentials: true,
    });
  }
}

export default new JobService();

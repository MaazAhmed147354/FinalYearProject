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

class CriteriaService {
  async createCriteria(
    job_id,
    name,
    experience_weight,
    min_experience_years,
    skills,
    keywords
  ) {
    // Format skills array to match backend expectations if needed
    const formattedSkills = skills.map(skill => ({
      name: skill.name,
      weight: parseInt(skill.weight),
      mandatory: Boolean(skill.mandatory)
    }));
    
    // Format keywords to ensure they're strings
    const formattedKeywords = keywords.map(keyword => String(keyword));
    
    // Get current user ID
    const userId = getUserId();
    console.log("Creating criteria for job ID:", job_id, "with user ID:", userId);
    
    return axios.post(
      BASE_API_URL + "/criteria/create",
      {
        job_id: job_id,
        name: name,
        experience_weight: parseInt(experience_weight),
        min_experience_years: parseInt(min_experience_years),
        skills: formattedSkills,
        keywords: formattedKeywords,
        // Include user_id if your backend API requires it
        user_id: userId
      },
      {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  async getCriteria(job_id) {
    return axios.get(BASE_API_URL + `/jobs/${job_id}/criteria`, {
      withCredentials: true,
    });
  }

  async applyShortlistingCriteria(job_id, criteria_id, threshold = 70, max_resumes = 0) {
    // Get current user ID
    const userId = getUserId();
    console.log("Applying shortlisting criteria with user ID:", userId);
    
    return axios.post(
      BASE_API_URL + "/criteria/apply",
      {
        job_id: job_id,
        criteria_id: criteria_id,
        threshold: threshold,
        max_resumes: max_resumes,
        // Include user_id if your backend API requires it
        user_id: userId
      },
      {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export default new CriteriaService();

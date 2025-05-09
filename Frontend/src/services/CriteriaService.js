import axios from "axios";

const BASE_API_URL = "http://localhost:3000/dev";

class CriteriaService {
  async createCriteria(
    job_id,
    name,
    experience_weight,
    min_experience_years,
    skills,
    keywords
  ) {
    return axios.post(
      BASE_API_URL + "/criteria/create",
      {
        job_id: job_id,
        name: name,
        experience_weight: experience_weight,
        min_experience_years: min_experience_years,
        skills: skills,
        keywords: keywords,
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

  async applyShortlistingCriteria(job_id, criteria_id) {
    return axios.post(
      BASE_API_URL + "/criteria/apply",
      {
        job_id: job_id,
        criteria_id: criteria_id,
      },
      {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export default new CriteriaService();

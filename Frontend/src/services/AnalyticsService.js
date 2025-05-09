import axios from "axios";

const BASE_API_URL = "http://localhost:3000/dev";

class AnalyticsService {
  async getJobAnalytics() {
    return axios.get(BASE_API_URL + "/analytics/jobs", {
      withCredentials: true,
    });
  }

  async getResumeAnalytics() {
    return axios.get(BASE_API_URL + "/analytics/resumes", {
      withCredentials: true,
    });
  }

  async getInterviewAnalytics() {
    return axios.get(BASE_API_URL + "/analytics/interviews", {
      withCredentials: true,
    });
  }

  async getRecruitmentFunnelAnalytics() {
    return axios.get(BASE_API_URL + "/analytics/funnel", {
      withCredentials: true,
    });
  }
}

export default new AnalyticsService();

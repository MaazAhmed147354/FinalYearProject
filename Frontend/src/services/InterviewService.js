import axios from "axios";

const BASE_API_URL = "http://localhost:3000/dev";

class InterviewService {
  async scheduleInterview(interviewData) {
    return axios.post(
      BASE_API_URL + "/interviews/schedule",  // Changed from "/api/interviews"
      interviewData,
      {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  async listInterviews(filters = {}) {
    return axios.get(BASE_API_URL + "/interviews/list", {  // Changed from "/api/interviews"
      params: filters,
      withCredentials: true,
    });
  }

  async getInterviewDetails(id) {
    return axios.get(BASE_API_URL + `/interviews/${id}`, {
      withCredentials: true,
    });
  }

  async updateInterview(id, updates) {
    return axios.put(BASE_API_URL + `/interviews/${id}`, updates, {
      withCredentials: true,
      headers: { "Content-Type": "application/json" },
    });
  }

  async cancelInterview(id, reason) {
    return axios.post(BASE_API_URL + `/interviews/${id}/cancel`, { reason }, {
      withCredentials: true,
      headers: { "Content-Type": "application/json" },
    });
  }

  async completeInterview(id, feedback) {
    return axios.post(BASE_API_URL + `/interviews/${id}/complete`, { feedback }, {
      withCredentials: true,
      headers: { "Content-Type": "application/json" },
    });
  }

  async findAvailableSlots(date, interviewers, duration = 60) {
    return axios.get(BASE_API_URL + "/interviews/available-slots", {
      params: { date, interviewers, duration },
      withCredentials: true,
    });
  }
}

export default new InterviewService();
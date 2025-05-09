import axios from "axios";

const BASE_API_URL = "http://localhost:3000/dev";

class InterviewService {
  async scheduleInterview(resume_id, participants, datetime) {
    return axios.post(
      BASE_API_URL + "/interviews/schedule",
      {
        resume_id: resume_id,
        participants: participants,
        datetime: datetime,
      },
      {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  async listInterviews() {
    return axios.get(BASE_API_URL + "/interviews/list", {
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

  async cancelInterview(id) {
    return axios.post(BASE_API_URL + `/interviews/${id}/cancel`, null, {
      withCredentials: true,
    });
  }

  async completeInterview(id) {
    return axios.post(BASE_API_URL + `/interviews/${id}/complete`, null, {
      withCredentials: true,
    });
  }

  async findAvailableSlots() {
    return axios.get(BASE_API_URL + "/interviews/available-slots", {
      withCredentials: true,
    });
  }
}

export default new InterviewService();

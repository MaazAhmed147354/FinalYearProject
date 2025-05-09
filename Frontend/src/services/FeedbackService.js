import axios from "axios";

const BASE_API_URL = "http://localhost:3000/dev";

class FeedbackService {
  async createFeedback(interview_id, reviewer_id, content, rating) {
    return axios.post(
      BASE_API_URL + "/feedback/create",
      {
        interview_id: interview_id,
        reviewer_id: reviewer_id,
        content: content,
        rating: rating,
      },
      {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  async getFeedback(id) {
    return axios.get(BASE_API_URL + `/feedback/${id}`, {
      withCredentials: true,
    });
  }
}

export default new FeedbackService();

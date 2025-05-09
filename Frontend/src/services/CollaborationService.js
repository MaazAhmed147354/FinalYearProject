import axios from "axios";

const BASE_API_URL = "http://localhost:3000/dev";

class CollaborationService {
  async addComment(user_id, resume_id, comment) {
    return axios.post(
      BASE_API_URL + "/comments/add",
      {
        user_id: user_id,
        resume_id: resume_id,
        comment: comment,
      },
      {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  async fetchNotifications(user_id) {
    return axios.get(BASE_API_URL + `/users/${user_id}/notifications`, {
      withCredentials: true,
    });
  }
}

export default new CollaborationService();

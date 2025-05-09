import axios from "axios";

const BASE_API_URL = "http://localhost:3000/dev";

class JobService {
  async createJob(title, description, department, deadline) {
    return axios.post(
      BASE_API_URL + "/jobs/create",
      {
        title: title,
        description: description,
        department: department,
        deadline: deadline,
      },
      {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  async listJobs() {
    return axios.get(BASE_API_URL + "/jobs/list", {
      withCredentials: true,
    });
  }

  async getJobDetails(id) {
    return axios.get(BASE_API_URL + `/jobs/${id}`, {
      withCredentials: true,
    });
  }

  async updateJob(id, title, description, department, deadline) {
    return axios.put(
      BASE_API_URL + `/jobs/${id}`,
      {
        title: title,
        description: description,
        department: department,
        deadline: deadline,
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

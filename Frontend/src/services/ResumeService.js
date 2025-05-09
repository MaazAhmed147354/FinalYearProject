import axios from "axios";

const BASE_API_URL = "http://localhost:3000/dev";

class ResumeService {
  async uploadResume(candidate_name, candidate_email, job_id, file) {
    const formData = new FormData();
    formData.append("candidate_name", candidate_name);
    formData.append("candidate_email", candidate_email);
    formData.append("job_id", job_id);
    formData.append("resume", file);

    return axios.post(BASE_API_URL + "/resumes/upload", formData, {
      withCredentials: true,
      headers: { "Content-Type": "multipart/form-data" },
    });
  }

  async listResumes() {
    return axios.get(BASE_API_URL + "/resumes/list", {
      withCredentials: true,
    });
  }

  async getResumeDetails(id) {
    return axios.get(BASE_API_URL + `/resumes/${id}`, {
      withCredentials: true,
    });
  }

  async updateResumeStatus(id, status) {
    return axios.put(
      BASE_API_URL + `/resumes/${id}/status`,
      { status: status },
      {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  async associateResumeWithJob(resume_id, job_id) {
    return axios.post(
      BASE_API_URL + "/resumes/associate",
      { resume_id: resume_id, job_id: job_id },
      {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  async getTopScoredResumesForJob(jobId) {
    return axios.get(BASE_API_URL + `/jobs/${jobId}/top-resumes`, {
      withCredentials: true,
    });
  }

  async downloadResumeFile(id) {
    return axios.get(BASE_API_URL + `/resumes/${id}/download`, {
      withCredentials: true,
      responseType: "blob",
    });
  }
}

export default new ResumeService();

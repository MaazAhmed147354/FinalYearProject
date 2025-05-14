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
    try {
      const response = await axios.get(BASE_API_URL + `/resumes/${id}/download`, {
        withCredentials: true,
        responseType: "blob",
        timeout: 30000, // 30 second timeout
        maxContentLength: 50 * 1024 * 1024, // 50MB max file size
        onDownloadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Download Progress: ${percentCompleted}%`);
        }
      });

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers['content-disposition'];
      const fileName = contentDisposition
        ? contentDisposition.split('filename=')[1].replace(/['"]/g, '')
        : `resume_${id}.pdf`;

      // Create blob URL
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);

      // Create temporary link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return response;
    } catch (error) {
      console.error('Download error:', error);
      
      if (error.response) {
        switch (error.response.status) {
          case 404:
            throw new Error('Resume file not found. The file might have been moved or deleted.');
          case 502:
            throw new Error('Server error. Please try again later.');
          default:
            throw new Error(`Download failed: ${error.response.data.message || 'Unknown error'}`);
        }
      }
      
      if (error.code === 'ECONNABORTED') {
        throw new Error('Download timed out. Please try again.');
      }
      
      throw new Error('Failed to download resume. Please try again later.');
    }
  }
}

export default new ResumeService();

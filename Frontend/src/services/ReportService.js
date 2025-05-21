import axios from "axios";

const BASE_API_URL = "http://localhost:3000/dev";

class ReportService {
  async generateCandidateReport(resume_id, user_id = 1) {
    return axios.post(
      BASE_API_URL + "/reports/candidate",
      { resume_id: resume_id, user_id: user_id },
      {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  async compareCandidates(resume_ids) {
    return axios.post(
      BASE_API_URL + "/reports/compare",
      { resume_ids: resume_ids },
      {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  async getReportsForResume(resume_id) {
    return axios.get(BASE_API_URL + `/resumes/${resume_id}/reports`, {
      withCredentials: true,
    });
  }

  async getReport(report_id) {
    return axios.get(BASE_API_URL + `/reports/${report_id}`, {
      withCredentials: true,
    });
  }

  async markReportAsSent(report_id) {
    return axios.post(BASE_API_URL + `/reports/${report_id}/mark-sent`, null, {
      withCredentials: true,
    });
  }
}

export default new ReportService();

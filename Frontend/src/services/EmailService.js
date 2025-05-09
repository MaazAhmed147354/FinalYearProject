import axios from "axios";

const BASE_API_URL = "http://localhost:3000/dev";

class EmailService {
  async syncEmails() {
    return axios.post(BASE_API_URL + "/emails/sync", null, {
      withCredentials: true,
    });
  }

  async listEmails() {
    return axios.get(BASE_API_URL + "/emails/list", {
      withCredentials: true,
    });
  }

  async extractResumeFromEmail(email_id, job_id) {
    return axios.post(
      BASE_API_URL + "/emails/extract-resume",
      { email_id: email_id, job_id: job_id },
      {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  async sendEmail(candidate_id, subject, body, attachments) {
    return axios.post(
      BASE_API_URL + "/emails/send",
      {
        candidate_id: candidate_id,
        subject: subject,
        body: body,
        attachments: attachments,
      },
      {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  async associateEmailWithJob(email_id, job_id) {
    return axios.post(
      BASE_API_URL + "/emails/associate",
      { email_id: email_id, job_id: job_id },
      {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  async updateEmailStatus(email_id, status) {
    return axios.put(
      BASE_API_URL + `/emails/${email_id}/status`,
      { status: status },
      {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export default new EmailService();

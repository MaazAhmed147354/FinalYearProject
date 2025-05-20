import axios from "axios";

const BASE_API_URL = "http://localhost:3000/dev";

class EmailService {
  async syncEmails() {
    return axios.post(BASE_API_URL + "/emails/sync", null, {
      withCredentials: true,
    });
  }

  async listEmails(filters = {}) {
    const queryParams = new URLSearchParams();
    if (filters.start_date) queryParams.append('start_date', filters.start_date);
    if (filters.end_date) queryParams.append('end_date', filters.end_date);
    if (filters.job_id) queryParams.append('job_id', filters.job_id);
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.status) queryParams.append('status', filters.status);

    const url = `${BASE_API_URL}/emails/list${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return axios.get(url, {
      withCredentials: true,
    });
  }

  async downloadResume(email_id) {
    try {
      // First get the email details to verify attachment exists
      const emailResponse = await axios.get(
        `${BASE_API_URL}/emails/${email_id}`,
        {
          withCredentials: true,
        }
      );

      const emailData = emailResponse.data.data;
      if (!emailData || !emailData.attachment_paths || emailData.attachment_paths.length === 0) {
        throw new Error('No attachments found for this email');
      }

      // Download the attachment
      const downloadResponse = await axios.get(
        `${BASE_API_URL}/emails/${email_id}/attachments/download`,
        {
          withCredentials: true,
          responseType: 'blob',
          timeout: 30000, // 30 second timeout
          maxContentLength: 50 * 1024 * 1024, // 50MB max file size
          onDownloadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log(`Download Progress: ${percentCompleted}%`);
          }
        }
      );

      // Create a blob from the response data
      const blob = new Blob([downloadResponse.data], { 
        type: downloadResponse.headers['content-type'] || 'application/pdf'
      });
      
      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      
      // Get the filename from the headers or use a default name
      const contentDisposition = downloadResponse.headers['content-disposition'];
      const fileName = contentDisposition
        ? contentDisposition.split('filename=')[1].replace(/['"]/g, '')
        : `resume_${email_id}.pdf`;
      
      link.setAttribute('download', fileName);
      
      // Append link to body, click it, and remove it
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the temporary URL
      window.URL.revokeObjectURL(url);
      
      return downloadResponse;
    } catch (error) {
      console.error('Download error:', error);
      
      // Check if the error has a response
      if (error.response) {
        const status = error.response.status;
        const errorMessage = error.response.data?.message;
        
        switch (status) {
          case 404:
            throw new Error('Resume attachment not found. The file might have been moved or deleted.');
          case 502:
            throw new Error('Server error. Please try again later.');
          case 401:
            throw new Error('Unauthorized. Please log in again.');
          case 403:
            throw new Error('You do not have permission to download this attachment.');
          default:
            throw new Error(errorMessage || `Download failed with status ${status}`);
        }
      }
      
      // Handle network errors
      if (error.code === 'ECONNABORTED') {
        throw new Error('Download timed out. Please try again.');
      }
      if (error.code === 'ERR_NETWORK') {
        throw new Error('Network error. Please check your internet connection.');
      }
      
      // Handle other errors
      throw new Error(error.message || 'Failed to download resume. Please try again later.');
    }
  }

  async extractResumeFromEmail(email_id, job_id) {
    try {
      // Extract and process the resume
      const response = await axios.post(
        `${BASE_API_URL}/emails/extract-resume`,
        { email_id, job_id },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      // Download the processed resume
      const downloadResponse = await axios.get(
        `${BASE_API_URL}/emails/${email_id}/processed-resume`,
        {
          withCredentials: true,
          responseType: 'blob',
        }
      );

      // Create a blob from the response data
      const blob = new Blob([downloadResponse.data], { 
        type: downloadResponse.headers['content-type'] || 'application/pdf'
      });
      
      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      
      // Get the filename from the headers or use a default name
      const contentDisposition = downloadResponse.headers['content-disposition'];
      const fileName = contentDisposition
        ? contentDisposition.split('filename=')[1].replace(/['"]/g, '')
        : `processed_resume_${email_id}.pdf`;
      
      link.setAttribute('download', fileName);
      
      // Append link to body, click it, and remove it
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the temporary URL
      window.URL.revokeObjectURL(url);

      return response;
    } catch (error) {
      console.error('Extract error:', error);
      if (error.response) {
        if (error.response.status === 502) {
          throw new Error('Server error. Please try again later.');
        } else if (error.response.status === 404) {
          throw new Error('Resume not found after extraction. Please try again.');
        }
      }
      throw new Error(error.message || 'Failed to extract resume');
    }
  }

  async sendEmail(candidate_id, subject, body, attachments) {
    return axios.post(
      BASE_API_URL + "/emails/send",
      {
        candidate_id,
        subject,
        body,
        attachments,
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
      { email_id, job_id },
      {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  async updateEmailStatus(email_id, status) {
    return axios.put(
      BASE_API_URL + `/emails/${email_id}/status`,
      { status },
      {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export default new EmailService();

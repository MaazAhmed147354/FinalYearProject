The logic of the database for the Smart Resume Parser project is structured around a modular and relational approach. Each table serves a specific purpose, enabling efficient data storage, management, and interaction between entities. Here's an explanation of the tables and their relationships:

---

### **1. `users` Table**
**Purpose**: Stores information about the users of the system, such as HR personnel and department members.

- **Fields**: 
  - `id`: Primary key to uniquely identify each user.
  - `role`: Differentiates between HR and Department users.
  - Other fields like `name`, `email`, and `password_hash` store user credentials and details.
  
**Logic**: This table provides the foundation for role-based access control. For example, HR can create job openings, while Department users receive notifications about shortlisted candidates.

---

### **2. `jobs` Table**
**Purpose**: Stores details about job openings created by HR.

- **Fields**:
  - `hr_id`: Links the job to the HR user who created it.
  - `required_skills`, `min_experience`, and `education`: Criteria for evaluating candidates.
  - `status`: Tracks whether the job is open or closed.

**Logic**: This table defines the positions available and acts as the parent for related resumes, criteria, and analytics. HR can manage jobs and associated applications.

---

### **3. `resumes` Table**
**Purpose**: Stores information about resumes submitted for specific job openings.

- **Fields**:
  - `job_id`: Links the resume to a specific job.
  - `candidate_name`, `candidate_email`: Stores applicant details.
  - `status`: Tracks the progress of the resume (e.g., pending, shortlisted, rejected).

**Logic**: This table is central to the system, storing candidate data and enabling HR and departments to manage applications.

---

### **4. `parsed_data` Table**
**Purpose**: Stores data extracted from resumes, such as skills, experience, and education.

- **Fields**:
  - `resume_id`: Links the parsed data to the respective resume.
  - `parsed_skills`, `parsed_experience`, and `parsed_education`: JSON fields for flexibility in storing parsed details.
  - `resume_score`: A computed score based on how well the resume matches job criteria.

**Logic**: This table provides the foundation for automated resume scoring and filtering. It is generated using the GPT API for parsing resumes.

---

### **5. `job_criteria` Table**
**Purpose**: Stores the criteria for each job, which is used for shortlisting resumes.

- **Fields**:
  - `job_id`: Links the criteria to the specific job.
  - `criteria`: A JSON object containing skills, experience weightage, and education requirements.

**Logic**: This table enables HR to define job-specific criteria and allows the system to rank resumes based on relevance.

---

### **6. `shortlist` Table**
**Purpose**: Tracks resumes that have been shortlisted for a specific job.

- **Fields**:
  - `job_id` and `resume_id`: Link shortlisted resumes to jobs and candidates.
  - `shortlist_date`: Records when the resume was shortlisted.

**Logic**: This table facilitates tracking shortlisted candidates and sharing updates with departments.

---

### **7. `interviews` Table**
**Purpose**: Schedules and manages interviews for shortlisted candidates.

- **Fields**:
  - `resume_id` and `job_id`: Link the interview to a specific candidate and job.
  - `interview_date`, `interview_link`: Schedule and online meeting link.
  - `status`: Tracks interview progress (e.g., scheduled, completed, canceled).

**Logic**: This table automates the interview process, including sending notifications and managing schedules.

---

### **8. `notifications` Table**
**Purpose**: Tracks system notifications for users (HR and departments).

- **Fields**:
  - `user_id`: Links the notification to the user.
  - `message`: Contains the notification content.
  - `is_read`: Tracks whether the notification has been viewed.

**Logic**: Ensures that users receive updates about events like shortlisted candidates, interviews, or application status changes.

---

### **9. `analytics` Table**
**Purpose**: Tracks recruitment metrics for job postings.

- **Fields**:
  - `job_id`: Links analytics to a specific job.
  - Metrics such as `total_resumes`, `shortlisted`, and `average_score` provide insights into recruitment efficiency.

**Logic**: This table powers the analytics dashboard, enabling HR to evaluate recruitment performance and optimize the process.

---

### **Relationships**
- **`users` ↔ `jobs`**: A user (HR) creates job postings.
- **`jobs` ↔ `resumes`**: Resumes are submitted for specific jobs.
- **`resumes` ↔ `parsed_data`**: Parsed data is linked to resumes for automated scoring.
- **`jobs` ↔ `job_criteria`**: Job criteria are defined for each job.
- **`resumes` ↔ `shortlist`**: Tracks shortlisted resumes for each job.
- **`resumes` ↔ `interviews`**: Scheduled interviews are linked to resumes and jobs.
- **`users` ↔ `notifications`**: Notifications are associated with users.
- **`jobs` ↔ `analytics`**: Recruitment metrics are tracked for each job.

---

### **Overall Logic**
1. **HR Workflow**:
   - HR registers, logs in, and creates job postings.
   - They define job criteria, receive resumes, and use the system to parse and score them.
   - Shortlisted resumes are tracked, and interviews are scheduled.

2. **Automation**:
   - Resumes are parsed automatically using AI.
   - The system scores resumes and ranks candidates based on job criteria.

3. **Collaboration**:
   - Notifications keep HR and department users informed.
   - Department users receive updates about shortlisted candidates and interview results.

4. **Analytics**:
   - Recruitment performance is evaluated using metrics like time-to-fill and average scores.

This structure ensures modularity, scalability, and efficient data management. Let me know if you need further clarifications or enhancements!

CREATE TABLE resumes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    candidate_name VARCHAR(255) NOT NULL,
    candidate_email VARCHAR(255) UNIQUE NOT NULL,
    resume_file VARCHAR(255) NOT NULL,
    submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Pending', 'Shortlisted', 'Rejected') DEFAULT 'Pending',
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

CREATE TABLE analytics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    total_resumes INT NOT NULL,
    shortlisted INT NOT NULL,
    average_score FLOAT NOT NULL,
    time_to_fill INT NOT NULL,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

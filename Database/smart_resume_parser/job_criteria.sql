CREATE TABLE job_criteria (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    criteria JSON NOT NULL,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

CREATE TABLE parsed_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    resume_id INT NOT NULL,
    parsed_skills JSON NOT NULL,
    parsed_experience JSON NOT NULL,
    parsed_education VARCHAR(255) NOT NULL,
    resume_score FLOAT NOT NULL,
    FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE
);

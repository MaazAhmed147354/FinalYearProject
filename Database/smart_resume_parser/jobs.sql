CREATE TABLE jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hr_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    required_skills JSON NOT NULL,
    min_experience INT NOT NULL,
    education VARCHAR(255) NOT NULL,
    status ENUM('Open', 'Closed') DEFAULT 'Open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hr_id) REFERENCES users(id) ON DELETE CASCADE
);

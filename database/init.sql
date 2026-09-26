CREATE TABLE IF NOT EXISTS destinations (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    location VARCHAR(150) NOT NULL,
    description TEXT,
    latitude DECIMAL(9,6) NOT NULL,
    longitude DECIMAL(9,6) NOT NULL,
    type VARCHAR(50) NOT NULL,
    difficulty VARCHAR(50) NOT NULL,
    planned_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
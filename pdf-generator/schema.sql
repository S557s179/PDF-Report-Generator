CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    status VARCHAR(50) DEFAULT 'pending',
    file_path TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    category VARCHAR(100),
    amount NUMERIC
);


INSERT INTO orders(category, amount)
VALUES
('Electronics',500),
('Electronics',700),
('Books',100),
('Books',200),
('Games',300);

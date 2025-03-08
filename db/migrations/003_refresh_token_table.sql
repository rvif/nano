-- +goose Up
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE, 
    token TEXT NOT NULL UNIQUE,
    expiry TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT now()
);

-- +goose Down
DROP TABLE refresh_tokens;
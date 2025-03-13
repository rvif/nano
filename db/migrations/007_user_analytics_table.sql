-- +goose Up
CREATE TABLE user_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total_urls INT NOT NULL DEFAULT 0,
    total_total_clicks INT NOT NULL DEFAULT 0,
    avg_daily_clicks DOUBLE PRECISION NOT NULL DEFAULT 0,
    created_at TIMESTAMP with time zone DEFAULT now(),
    updated_at TIMESTAMP with time zone DEFAULT now()
);

-- +goose Down
DROP TABLE user_analytics;
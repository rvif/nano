-- +goose Up
CREATE TABLE urls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    url text NOT NULL UNIQUE, 
    short_url text NOT NULL UNIQUE,
    total_clicks INT DEFAULT 0,         
    daily_clicks INT DEFAULT 0,
    last_clicked TIMESTAMP with time zone,  
    created_at TIMESTAMP with time zone DEFAULT now(),
    updated_at TIMESTAMP with time zone DEFAULT now()
);

--- TODO: cron-job to reset daily_clicks
--- TODO: trigger to update updated_at when total_clicks, daily_clicks, short_url is updated

-- +goose Down
DROP TABLE urls;
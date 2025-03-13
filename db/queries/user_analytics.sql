-- name: CreateAnalytics :one
INSERT INTO user_analytics (id, user_id, total_urls, total_total_clicks, avg_daily_clicks, created_at, updated_at)
VALUES ($1, $2, 0, 0, 0, NOW(), NOW())
RETURNING id, user_id, total_urls, total_total_clicks, avg_daily_clicks, created_at, updated_at;


-- name: UpdateAnalytics :one
UPDATE user_analytics
SET 
    total_urls = total_urls + $1, 
    total_total_clicks = total_total_clicks + $2, 
    avg_daily_clicks = total_total_clicks + $2 / GREATEST(EXTRACT(EPOCH FROM NOW() - created_at) / 86400, 1), 
    updated_at = now()
WHERE user_id = $3
RETURNING id, user_id, total_urls, total_total_clicks, avg_daily_clicks, created_at, updated_at;

-- name: GetAnalyticsByUserId :one
SELECT id, user_id, total_urls, total_total_clicks, avg_daily_clicks, created_at, updated_at
FROM user_analytics 
WHERE user_id = $1;

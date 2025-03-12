-- name: CreateURL :one
INSERT INTO urls (user_id, url, short_url)
VALUES ($1, $2, $3)
RETURNING id, user_id, url, short_url, total_clicks, daily_clicks, last_clicked, created_at, updated_at;

-- name: GetURLsByUserID :many
SELECT id, url, short_url, created_at, updated_at 
FROM urls 
WHERE user_id = $1;

-- name: SlugExists :one
SELECT EXISTS(SELECT 1 FROM urls WHERE short_url = $1);

-- name: GetURLByShortURL :one
SELECT url FROM urls WHERE short_url = $1;

-- name: UpdateShortURL :one
UPDATE urls 
SET short_url = $1, updated_at = now()
WHERE id = $2
RETURNING id, user_id, url, short_url, total_clicks, daily_clicks, last_clicked, created_at, updated_at;

-- name: DeleteURL :exec
DELETE FROM urls WHERE short_url = $1;

-- name: GetURLAnalytics :one
SELECT total_clicks, daily_clicks, last_clicked 
FROM urls 
WHERE short_url = $1;

-- name: IncrementURLClicks :exec
UPDATE urls
SET total_clicks = total_clicks + 1,
    daily_clicks = daily_clicks + 1, 
    last_clicked = now()
WHERE short_url = $1;

-- name: ResetDailyClicks :exec
UPDATE urls 
SET daily_clicks = 0;

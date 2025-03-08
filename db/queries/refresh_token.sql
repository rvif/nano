-- name: StoreRefreshToken :exec
INSERT INTO refresh_tokens (user_id, token, expiry)
VALUES ($1, $2, $3);

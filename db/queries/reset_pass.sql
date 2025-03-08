-- name: StoreResetToken :exec
INSERT INTO password_reset_tokens (user_id, token, expiry)
VALUES ($1, $2, $3);

-- name: GetUserByResetToken :one
SELECT user_id, expiry FROM password_reset_tokens WHERE token = $1 AND expiry > now();

-- name: UpdateUserPassword :exec
UPDATE users SET hashed_password = $1 WHERE id = $2;

-- name: DeleteResetToken :exec
DELETE FROM password_reset_tokens WHERE token = $1;
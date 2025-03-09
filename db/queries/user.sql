-- name: CreateUser :one
INSERT INTO users (id, username, email, hashed_password, pfp_url)
VALUES ($1, $2, $3, $4, $5)
RETURNING id, username, email, pfp_url, created_at, updated_at;

-- name: GetUserByEmail :one
SELECT * FROM users WHERE email = $1;

-- name: GetUserByUserName :one
SELECT * FROM users WHERE username = $1;

-- name: GetUserById :one
SELECT * FROM users WHERE id = $1;
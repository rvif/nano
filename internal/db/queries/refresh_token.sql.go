// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.25.0
// source: refresh_token.sql

package queries

import (
	"context"
	"time"

	"github.com/google/uuid"
)

const storeRefreshToken = `-- name: StoreRefreshToken :exec
INSERT INTO refresh_tokens (user_id, token, expiry)
VALUES ($1, $2, $3)
`

type StoreRefreshTokenParams struct {
	UserID uuid.NullUUID
	Token  string
	Expiry time.Time
}

func (q *Queries) StoreRefreshToken(ctx context.Context, arg StoreRefreshTokenParams) error {
	_, err := q.db.ExecContext(ctx, storeRefreshToken, arg.UserID, arg.Token, arg.Expiry)
	return err
}

-- +goose Up
ALTER TABLE users ADD COLUMN pfp_url TEXT DEFAULT '/images/default_pfp.jpg' NOT NULL;

-- +goose Down
ALTER TABLE users DROP COLUMN pfp_url;
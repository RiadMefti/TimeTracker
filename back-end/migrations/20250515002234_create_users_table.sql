-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS users (
    id text PRIMARY KEY,
    email varchar(255) NOT NULL UNIQUE
);

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS users;
-- +goose StatementEnd

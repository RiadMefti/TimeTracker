-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS times(
    id serial PRIMARY KEY,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    description text,
    user_id text NOT NULL,
    project_id integer,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS times;
-- +goose StatementEnd
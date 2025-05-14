package repositories

import "database/sql"

type UserRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) *UserRepository {

	return &UserRepository{
		db: db,
	}

}

func (r *UserRepository) CreateUser(email string) error {
	_, err := r.db.Exec("INSERT INTO users (email) VALUES ($1)", email)
	return err
}

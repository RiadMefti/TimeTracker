package repositories

import (
	"database/sql"

	"github.com/RiadMefti/TimeTracker/back-end/models"
)

type UserRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) *UserRepository {

	return &UserRepository{
		db: db,
	}

}

func (r *UserRepository) CreateUser(user models.User) error {
	_, err := r.db.Exec("INSERT INTO users (id, email) VALUES ($1, $2)", user.ID, user.Email)
	return err
}

func (r *UserRepository) GetUserBy(id string) (bool, error) {
	exists := false
	err := r.db.QueryRow("SELECT EXISTS(SELECT 1 FROM users WHERE id = $1)", id).Scan(&exists)
	return exists, err
}

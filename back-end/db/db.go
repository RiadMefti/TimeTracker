package db

import (
	"database/sql"
	"fmt"

	"github.com/RiadMefti/TimeTracker/back-end/utils"
	_ "github.com/lib/pq"
)

func InitDb() (*sql.DB, error) {
	// Get database credentials from environment variables
	dbHost := utils.GetEnv("DB_HOST", "localhost")
	dbUser := utils.GetEnv("DB_USER", "postgres")
	dbPassword := utils.GetEnv("DB_PASSWORD", "postgres")
	dbName := utils.GetEnv("DB_NAME", "app_db")
	dbPort := utils.GetEnv("DB_PORT", "5432")
	// Construct connection string
	connexionString := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		dbHost, dbPort, dbUser, dbPassword, dbName)

	db, err := sql.Open("postgres", connexionString)
	if err != nil {
		return nil, fmt.Errorf("failed to open database connection: %w ", err)
	}

	if db.Ping() != nil {
		return nil, fmt.Errorf("failed to ping database : %w ", err)
	}
	return db, nil
}

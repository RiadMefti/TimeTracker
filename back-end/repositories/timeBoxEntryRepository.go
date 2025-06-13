package repositories

import (
	"database/sql"

	"github.com/RiadMefti/TimeTracker/back-end/models"
)

type TimeBoxEntryRepository struct {
	db *sql.DB
}

func NewTimeBoxEntryRepository(db *sql.DB) *TimeBoxEntryRepository {
	return &TimeBoxEntryRepository{db: db}
}

func (r *TimeBoxEntryRepository) GetUserTimeBoxEntries(userID string) ([]models.TimeBoxEntry, error) {
	rows, err := r.db.Query(
		`SELECT id, description, project_id, start_date, end_date 
         FROM times WHERE user_id = $1`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var entries []models.TimeBoxEntry
	for rows.Next() {
		var entry models.TimeBoxEntry
		err := rows.Scan(&entry.ID, &entry.Description, &entry.ProjectID, &entry.StartDate, &entry.EndDate)
		if err != nil {
			return nil, err
		}
		entries = append(entries, entry)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	// Initialize with empty slice instead of nil
	if entries == nil {
		entries = []models.TimeBoxEntry{}
	}

	return entries, nil
}

func (r *TimeBoxEntryRepository) CreateTimeBoxEntry(entry models.TimeBoxEntryCreate, userID string) ([]models.TimeBoxEntry, error) {
	_, err := r.db.Exec(
		`INSERT INTO times (description, project_id, start_date, end_date, user_id)
         VALUES ($1, $2, $3, $4, $5)`,
		entry.Description, entry.ProjectID, entry.StartDate, entry.EndDate, userID,
	)
	if err != nil {
		return nil, err
	}
	return r.GetUserTimeBoxEntries(userID)
}

func (r *TimeBoxEntryRepository) UpdateTimeBoxEntry(entry models.TimeBoxEntry, userID string) ([]models.TimeBoxEntry, error) {
	_, err := r.db.Exec(
		`UPDATE times SET description = $1, project_id = $2, start_date = $3, end_date = $4
         WHERE id = $5 AND user_id = $6`,
		entry.Description, entry.ProjectID, entry.StartDate, entry.EndDate, entry.ID, userID,
	)
	if err != nil {
		return nil, err
	}
	return r.GetUserTimeBoxEntries(userID)
}

func (r *TimeBoxEntryRepository) DeleteTimeBoxEntry(timeBoxEntryID int, userID string) ([]models.TimeBoxEntry, error) {
	_, err := r.db.Exec(
		`DELETE FROM times WHERE id = $1 AND user_id = $2`, timeBoxEntryID, userID,
	)
	if err != nil {
		return nil, err
	}
	return r.GetUserTimeBoxEntries(userID)
}

func (r *TimeBoxEntryRepository) AssignProjectToTimeBox(timeBoxEntryID int, projectID *int, userID string) ([]models.TimeBoxEntry, error) {
	_, err := r.db.Exec(
		`UPDATE times SET project_id = $1 WHERE id = $2 AND user_id = $3`, projectID, timeBoxEntryID, userID,
	)
	if err != nil {
		return nil, err
	}
	return r.GetUserTimeBoxEntries(userID)
}

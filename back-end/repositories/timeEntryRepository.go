package repositories

import (
	"database/sql"

	"github.com/RiadMefti/TimeTracker/back-end/models"
)

type TimeEntryRepository struct {
	db *sql.DB
}

func NewTimeEntryRepository(db *sql.DB) *TimeEntryRepository {
	return &TimeEntryRepository{db: db}
}

func (r *TimeEntryRepository) GetUserTimeEntries(userID string) ([]models.TimeEntry, error) {
	rows, err := r.db.Query(
		`SELECT id, description, project_id, start_date, end_date 
         FROM times WHERE user_id = $1`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var entries []models.TimeEntry
	for rows.Next() {
		var entry models.TimeEntry
		err := rows.Scan(&entry.ID, &entry.Description, &entry.ProjectID, &entry.StartDate, &entry.EndDate)
		if err != nil {
			return nil, err
		}
		entries = append(entries, entry)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return entries, nil
}

func (r *TimeEntryRepository) CreateTimeEntry(entry models.TimeEntryCreate, userID string) ([]models.TimeEntry, error) {
	_, err := r.db.Exec(
		`INSERT INTO times (description, project_id, start_date, end_date, user_id)
         VALUES ($1, $2, $3, $4, $5)`,
		entry.Description, entry.ProjectID, entry.StartDate, entry.EndDate, userID,
	)
	if err != nil {
		return nil, err
	}
	return r.GetUserTimeEntries(userID)
}

func (r *TimeEntryRepository) UpdateTimeEntry(entry models.TimeEntry, userID string) ([]models.TimeEntry, error) {
	_, err := r.db.Exec(
		`UPDATE times SET description = $1, project_id = $2, start_date = $3, end_date = $4
         WHERE id = $5 AND user_id = $6`,
		entry.Description, entry.ProjectID, entry.StartDate, entry.EndDate, entry.ID, userID,
	)
	if err != nil {
		return nil, err
	}
	return r.GetUserTimeEntries(userID)
}

func (r *TimeEntryRepository) DeleteTimeEntry(timeEntryID int, userID string) ([]models.TimeEntry, error) {
	_, err := r.db.Exec(
		`DELETE FROM times WHERE id = $1 AND user_id = $2`, timeEntryID, userID,
	)
	if err != nil {
		return nil, err
	}
	return r.GetUserTimeEntries(userID)
}

func (r *TimeEntryRepository) AssignProjectToTime(timeEntryID int, projectID *int, userID string) ([]models.TimeEntry, error) {
	_, err := r.db.Exec(
		`UPDATE times SET project_id = $1 WHERE id = $2 AND user_id = $3`, projectID, timeEntryID, userID,
	)
	if err != nil {
		return nil, err
	}
	return r.GetUserTimeEntries(userID)
}

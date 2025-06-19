package repositories

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/RiadMefti/TimeTracker/back-end/models"
)

type NoteRepository struct {
	db *sql.DB
}

func NewNoteRepository(db *sql.DB) *NoteRepository {
	return &NoteRepository{db: db}
}

func (r *NoteRepository) Create(note *models.NoteCreate, userID string) (*models.Note, error) {
	query := `
		INSERT INTO notes (title, content, folder_id, user_id) 
		VALUES ($1, $2, $3, $4) 
		RETURNING id
	`
	
	var id int
	err := r.db.QueryRow(query, note.Title, note.Content, note.FolderID, userID).Scan(&id)
	if err != nil {
		return nil, fmt.Errorf("failed to create note: %w", err)
	}

	return r.GetByID(id, userID)
}

func (r *NoteRepository) GetByID(id int, userID string) (*models.Note, error) {
	query := `
		SELECT id, title, content, folder_id, user_id, created, updated 
		FROM notes 
		WHERE id = $1 AND user_id = $2
	`
	
	row := r.db.QueryRow(query, id, userID)
	
	var note models.Note
	var folderID sql.NullInt64
	
	err := row.Scan(&note.ID, &note.Title, &note.Content, &folderID, &note.UserID, &note.Created, &note.Updated)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("note not found")
		}
		return nil, fmt.Errorf("failed to get note: %w", err)
	}
	
	if folderID.Valid {
		fid := int(folderID.Int64)
		note.FolderID = &fid
	}
	
	return &note, nil
}

func (r *NoteRepository) GetAllByUser(userID string) ([]*models.Note, error) {
	query := `
		SELECT id, title, content, folder_id, user_id, created, updated 
		FROM notes 
		WHERE user_id = $1 
		ORDER BY updated DESC
	`
	
	rows, err := r.db.Query(query, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get notes: %w", err)
	}
	defer rows.Close()
	
	notes := make([]*models.Note, 0) // Initialize as empty slice instead of nil
	
	for rows.Next() {
		var note models.Note
		var folderID sql.NullInt64
		
		err := rows.Scan(&note.ID, &note.Title, &note.Content, &folderID, &note.UserID, &note.Created, &note.Updated)
		if err != nil {
			return nil, fmt.Errorf("failed to scan note: %w", err)
		}
		
		if folderID.Valid {
			fid := int(folderID.Int64)
			note.FolderID = &fid
		}
		
		notes = append(notes, &note)
	}
	
	return notes, nil
}

func (r *NoteRepository) GetByFolder(folderID *int, userID string) ([]*models.Note, error) {
	var query string
	var args []interface{}
	
	if folderID == nil {
		query = `
			SELECT id, title, content, folder_id, user_id, created, updated 
			FROM notes 
			WHERE user_id = $1 AND folder_id IS NULL 
			ORDER BY updated DESC
		`
		args = []interface{}{userID}
	} else {
		query = `
			SELECT id, title, content, folder_id, user_id, created, updated 
			FROM notes 
			WHERE user_id = $1 AND folder_id = $2 
			ORDER BY updated DESC
		`
		args = []interface{}{userID, *folderID}
	}
	
	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to get notes by folder: %w", err)
	}
	defer rows.Close()
	
	notes := make([]*models.Note, 0) // Initialize as empty slice instead of nil
	
	for rows.Next() {
		var note models.Note
		var folderIDNull sql.NullInt64
		
		err := rows.Scan(&note.ID, &note.Title, &note.Content, &folderIDNull, &note.UserID, &note.Created, &note.Updated)
		if err != nil {
			return nil, fmt.Errorf("failed to scan note: %w", err)
		}
		
		if folderIDNull.Valid {
			fid := int(folderIDNull.Int64)
			note.FolderID = &fid
		}
		
		notes = append(notes, &note)
	}
	
	return notes, nil
}

func (r *NoteRepository) Update(id int, note *models.NoteUpdate, userID string) (*models.Note, error) {
	query := `
		UPDATE notes 
		SET title = $1, content = $2, folder_id = $3, updated = $4 
		WHERE id = $5 AND user_id = $6
	`
	
	_, err := r.db.Exec(query, note.Title, note.Content, note.FolderID, time.Now(), id, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to update note: %w", err)
	}
	
	return r.GetByID(id, userID)
}

func (r *NoteRepository) Delete(id int, userID string) error {
	query := `DELETE FROM notes WHERE id = $1 AND user_id = $2`
	
	result, err := r.db.Exec(query, id, userID)
	if err != nil {
		return fmt.Errorf("failed to delete note: %w", err)
	}
	
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get affected rows: %w", err)
	}
	
	if rowsAffected == 0 {
		return fmt.Errorf("note not found")
	}
	
	return nil
}

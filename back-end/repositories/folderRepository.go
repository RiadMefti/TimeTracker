package repositories

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/RiadMefti/TimeTracker/back-end/models"
)

type FolderRepository struct {
	db *sql.DB
}

func NewFolderRepository(db *sql.DB) *FolderRepository {
	return &FolderRepository{db: db}
}

func (r *FolderRepository) Create(folder *models.FolderCreate, userID string) (*models.Folder, error) {
	query := `
		INSERT INTO folders (name, parent_id, user_id) 
		VALUES ($1, $2, $3) 
		RETURNING id
	`
	
	var id int
	err := r.db.QueryRow(query, folder.Name, folder.ParentID, userID).Scan(&id)
	if err != nil {
		return nil, fmt.Errorf("failed to create folder: %w", err)
	}

	return r.GetByID(id, userID)
}

func (r *FolderRepository) GetByID(id int, userID string) (*models.Folder, error) {
	query := `
		SELECT id, name, parent_id, user_id, created, updated 
		FROM folders 
		WHERE id = $1 AND user_id = $2
	`
	
	row := r.db.QueryRow(query, id, userID)
	
	var folder models.Folder
	var parentID sql.NullInt64
	
	err := row.Scan(&folder.ID, &folder.Name, &parentID, &folder.UserID, &folder.Created, &folder.Updated)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("folder not found")
		}
		return nil, fmt.Errorf("failed to get folder: %w", err)
	}
	
	if parentID.Valid {
		pid := int(parentID.Int64)
		folder.ParentID = &pid
	}
	
	return &folder, nil
}

func (r *FolderRepository) GetAllByUser(userID string) ([]*models.Folder, error) {
	query := `
		SELECT id, name, parent_id, user_id, created, updated 
		FROM folders 
		WHERE user_id = $1 
		ORDER BY name ASC
	`
	
	rows, err := r.db.Query(query, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get folders: %w", err)
	}
	defer rows.Close()
	
	folders := make([]*models.Folder, 0) // Initialize as empty slice instead of nil
	
	for rows.Next() {
		var folder models.Folder
		var parentID sql.NullInt64
		
		err := rows.Scan(&folder.ID, &folder.Name, &parentID, &folder.UserID, &folder.Created, &folder.Updated)
		if err != nil {
			return nil, fmt.Errorf("failed to scan folder: %w", err)
		}
		
		if parentID.Valid {
			pid := int(parentID.Int64)
			folder.ParentID = &pid
		}
		
		folders = append(folders, &folder)
	}
	
	return folders, nil
}

func (r *FolderRepository) GetByParent(parentID *int, userID string) ([]*models.Folder, error) {
	var query string
	var args []interface{}
	
	if parentID == nil {
		query = `
			SELECT id, name, parent_id, user_id, created, updated 
			FROM folders 
			WHERE user_id = $1 AND parent_id IS NULL 
			ORDER BY name ASC
		`
		args = []interface{}{userID}
	} else {
		query = `
			SELECT id, name, parent_id, user_id, created, updated 
			FROM folders 
			WHERE user_id = $1 AND parent_id = $2 
			ORDER BY name ASC
		`
		args = []interface{}{userID, *parentID}
	}
	
	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to get folders by parent: %w", err)
	}
	defer rows.Close()
	
	folders := make([]*models.Folder, 0) // Initialize as empty slice instead of nil
	
	for rows.Next() {
		var folder models.Folder
		var parentIDNull sql.NullInt64
		
		err := rows.Scan(&folder.ID, &folder.Name, &parentIDNull, &folder.UserID, &folder.Created, &folder.Updated)
		if err != nil {
			return nil, fmt.Errorf("failed to scan folder: %w", err)
		}
		
		if parentIDNull.Valid {
			pid := int(parentIDNull.Int64)
			folder.ParentID = &pid
		}
		
		folders = append(folders, &folder)
	}
	
	return folders, nil
}

func (r *FolderRepository) Update(id int, folder *models.FolderUpdate, userID string) (*models.Folder, error) {
	query := `
		UPDATE folders 
		SET name = $1, parent_id = $2, updated = $3 
		WHERE id = $4 AND user_id = $5
	`
	
	_, err := r.db.Exec(query, folder.Name, folder.ParentID, time.Now(), id, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to update folder: %w", err)
	}
	
	return r.GetByID(id, userID)
}

func (r *FolderRepository) Delete(id int, userID string) error {
	query := `DELETE FROM folders WHERE id = $1 AND user_id = $2`
	
	result, err := r.db.Exec(query, id, userID)
	if err != nil {
		return fmt.Errorf("failed to delete folder: %w", err)
	}
	
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get affected rows: %w", err)
	}
	
	if rowsAffected == 0 {
		return fmt.Errorf("folder not found")
	}
	
	return nil
}

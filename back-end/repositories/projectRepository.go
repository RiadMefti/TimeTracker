package repositories

import (
	"database/sql"

	"github.com/RiadMefti/TimeTracker/back-end/models"
)

type ProjectRepository struct {
	db *sql.DB
}

func NewProjectRepository(db *sql.DB) *ProjectRepository {
	return &ProjectRepository{
		db: db,
	}
}

func (r *ProjectRepository) GetUserProjects(userId string) ([]models.ProjectDto, error) {

	rows, err := r.db.Query("SELECT  id, name, description, color FROM projects WHERE user_id =($1)", userId)
	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var projects []models.ProjectDto

	for rows.Next() {
		var project models.ProjectDto

		err := rows.Scan(&project.ID, &project.Name, &project.Description, &project.Color)
		if err != nil {
			return nil, err
		}

		projects = append(projects, project)
	}

	err = rows.Err()
	if err != nil {
		return nil, err
	}

	return projects, nil

}

func (r *ProjectRepository) CreateUserProject(projectToCreate models.ProjectCreate, userID string) ([]models.ProjectDto, error) {
	_, err := r.db.Exec(
		"INSERT INTO projects (name, description, color, user_id) VALUES ($1, $2, $3, $4)",
		projectToCreate.Name, projectToCreate.Description, projectToCreate.Color, userID,
	)
	if err != nil {
		return nil, err
	}
	return r.GetUserProjects(userID)
}

func (r *ProjectRepository) UpdateUserProject(projectToUpdate models.ProjectDto, userID string) ([]models.ProjectDto, error) {
	_, err := r.db.Exec(
		"UPDATE projects SET name = $1, description = $2, color = $3 WHERE id = $4 AND user_id = $5",
		projectToUpdate.Name, projectToUpdate.Description, projectToUpdate.Color, projectToUpdate.ID, userID,
	)
	if err != nil {
		return nil, err
	}
	return r.GetUserProjects(userID)
}
func (r *ProjectRepository) DeleteUserProject(projectId string, userID string) ([]models.ProjectDto, error) {

	_, err := r.db.Exec(
		"DELETE FROM projects WHERE id = ($1) AND user_id = ($2)",
		projectId, userID,
	)
	if err != nil {
		return nil, err
	}
	return r.GetUserProjects(userID)
}

package services

import (
	"github.com/RiadMefti/TimeTracker/back-end/models"
	"github.com/RiadMefti/TimeTracker/back-end/repositories"
)

type ProjectService struct {
	projectRepository *repositories.ProjectRepository
}

func NewProjectService(projectRepository *repositories.ProjectRepository) *ProjectService {
	return &ProjectService{
		projectRepository: projectRepository,
	}
}

func (s *ProjectService) GetUserProjects(userID string) ([]models.ProjectDto, error) {
	return s.projectRepository.GetUserProjects(userID)
}

func (s *ProjectService) CreateUserProject(projectToCreate models.ProjectCreate, userID string) ([]models.ProjectDto, error) {
	return s.projectRepository.CreateUserProject(projectToCreate, userID)
}

func (s *ProjectService) UpdateUserProject(projectToUpdate models.ProjectDto, userID string) ([]models.ProjectDto, error) {
	return s.projectRepository.UpdateUserProject(projectToUpdate, userID)
}

func (s *ProjectService) DeleteUserProject(projectId string, userID string) ([]models.ProjectDto, error) {
	return s.projectRepository.DeleteUserProject(projectId, userID)
}

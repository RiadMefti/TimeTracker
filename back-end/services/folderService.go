package services

import (
	"fmt"
	"github.com/RiadMefti/TimeTracker/back-end/models"
	"github.com/RiadMefti/TimeTracker/back-end/repositories"
)

type FolderService struct {
	repo *repositories.FolderRepository
}

func NewFolderService(repo *repositories.FolderRepository) *FolderService {
	return &FolderService{repo: repo}
}

func (s *FolderService) CreateFolder(folder *models.FolderCreate, userID string) (*models.Folder, error) {
	// Validate folder name
	if folder.Name == "" {
		return nil, fmt.Errorf("folder name cannot be empty")
	}

	// If parent folder is specified, check if it exists and belongs to user
	if folder.ParentID != nil {
		_, err := s.repo.GetByID(*folder.ParentID, userID)
		if err != nil {
			return nil, fmt.Errorf("parent folder not found")
		}
	}

	return s.repo.Create(folder, userID)
}

func (s *FolderService) GetFolder(id int, userID string) (*models.Folder, error) {
	return s.repo.GetByID(id, userID)
}

func (s *FolderService) GetAllFolders(userID string) ([]*models.Folder, error) {
	return s.repo.GetAllByUser(userID)
}

func (s *FolderService) GetFoldersByParent(parentID *int, userID string) ([]*models.Folder, error) {
	return s.repo.GetByParent(parentID, userID)
}

func (s *FolderService) UpdateFolder(id int, folder *models.FolderUpdate, userID string) (*models.Folder, error) {
	// Validate folder name
	if folder.Name == "" {
		return nil, fmt.Errorf("folder name cannot be empty")
	}

	// Check if folder exists and belongs to user
	_, err := s.repo.GetByID(id, userID)
	if err != nil {
		return nil, err
	}

	// If parent folder is specified, check if it exists and belongs to user
	if folder.ParentID != nil {
		// Prevent circular reference
		if *folder.ParentID == id {
			return nil, fmt.Errorf("a folder cannot be its own parent")
		}

		_, err := s.repo.GetByID(*folder.ParentID, userID)
		if err != nil {
			return nil, fmt.Errorf("parent folder not found")
		}
	}

	return s.repo.Update(id, folder, userID)
}

func (s *FolderService) DeleteFolder(id int, userID string) error {
	// Check if folder exists and belongs to user
	_, err := s.repo.GetByID(id, userID)
	if err != nil {
		return err
	}

	return s.repo.Delete(id, userID)
}

package services

import (
	"fmt"
	"github.com/RiadMefti/TimeTracker/back-end/models"
	"github.com/RiadMefti/TimeTracker/back-end/repositories"
)

type NoteService struct {
	repo *repositories.NoteRepository
}

func NewNoteService(repo *repositories.NoteRepository) *NoteService {
	return &NoteService{repo: repo}
}

func (s *NoteService) CreateNote(note *models.NoteCreate, userID string) (*models.Note, error) {
	// Validate note title
	if note.Title == "" {
		return nil, fmt.Errorf("note title cannot be empty")
	}

	return s.repo.Create(note, userID)
}

func (s *NoteService) GetNote(id int, userID string) (*models.Note, error) {
	return s.repo.GetByID(id, userID)
}

func (s *NoteService) GetAllNotes(userID string) ([]*models.Note, error) {
	return s.repo.GetAllByUser(userID)
}

func (s *NoteService) GetNotesByFolder(folderID *int, userID string) ([]*models.Note, error) {
	return s.repo.GetByFolder(folderID, userID)
}

func (s *NoteService) UpdateNote(id int, note *models.NoteUpdate, userID string) (*models.Note, error) {
	// Validate note title
	if note.Title == "" {
		return nil, fmt.Errorf("note title cannot be empty")
	}

	// Check if note exists and belongs to user
	_, err := s.repo.GetByID(id, userID)
	if err != nil {
		return nil, err
	}

	return s.repo.Update(id, note, userID)
}

func (s *NoteService) DeleteNote(id int, userID string) error {
	// Check if note exists and belongs to user
	_, err := s.repo.GetByID(id, userID)
	if err != nil {
		return err
	}

	return s.repo.Delete(id, userID)
}

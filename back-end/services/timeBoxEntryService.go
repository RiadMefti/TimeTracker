package services

import (
	"github.com/RiadMefti/TimeTracker/back-end/models"
	"github.com/RiadMefti/TimeTracker/back-end/repositories"
)

type TimeBoxEntryService struct {
	timeBoxEntryRepository *repositories.TimeBoxEntryRepository
}

func NewTimeBoxEntryService(timeBoxEntryRepository *repositories.TimeBoxEntryRepository) *TimeBoxEntryService {
	return &TimeBoxEntryService{
		timeBoxEntryRepository: timeBoxEntryRepository,
	}
}

func (s *TimeBoxEntryService) GetUserTimeBoxEntries(userID string) ([]models.TimeBoxEntry, error) {
	return s.timeBoxEntryRepository.GetUserTimeBoxEntries(userID)
}

func (s *TimeBoxEntryService) CreateTimeBoxEntry(entry models.TimeBoxEntryCreate, userID string) ([]models.TimeBoxEntry, error) {
	return s.timeBoxEntryRepository.CreateTimeBoxEntry(entry, userID)
}

func (s *TimeBoxEntryService) UpdateTimeBoxEntry(entry models.TimeBoxEntry, userID string) ([]models.TimeBoxEntry, error) {
	return s.timeBoxEntryRepository.UpdateTimeBoxEntry(entry, userID)
}

func (s *TimeBoxEntryService) DeleteTimeBoxEntry(timeBoxEntryID int, userID string) ([]models.TimeBoxEntry, error) {
	return s.timeBoxEntryRepository.DeleteTimeBoxEntry(timeBoxEntryID, userID)
}

func (s *TimeBoxEntryService) AssignProjectToTimeBox(timeBoxEntryID int, projectID *int, userID string) ([]models.TimeBoxEntry, error) {
	return s.timeBoxEntryRepository.AssignProjectToTimeBox(timeBoxEntryID, projectID, userID)
}

package services

import (
	"github.com/RiadMefti/TimeTracker/back-end/models"
	"github.com/RiadMefti/TimeTracker/back-end/repositories"
)

type TimeEntryService struct {
	timeEntryRepository *repositories.TimeEntryRepository
}

func NewTimeEntryService(timeEntryRepository *repositories.TimeEntryRepository) *TimeEntryService {
	return &TimeEntryService{
		timeEntryRepository: timeEntryRepository,
	}
}

func (s *TimeEntryService) GetUserTimeEntries(userID string) ([]models.TimeEntry, error) {
	return s.timeEntryRepository.GetUserTimeEntries(userID)
}

func (s *TimeEntryService) CreateTimeEntry(entry models.TimeEntryCreate, userID string) ([]models.TimeEntry, error) {
	return s.timeEntryRepository.CreateTimeEntry(entry, userID)
}

func (s *TimeEntryService) UpdateTimeEntry(entry models.TimeEntry, userID string) ([]models.TimeEntry, error) {
	return s.timeEntryRepository.UpdateTimeEntry(entry, userID)
}

func (s *TimeEntryService) DeleteTimeEntry(timeEntryID int, userID string) ([]models.TimeEntry, error) {
	return s.timeEntryRepository.DeleteTimeEntry(timeEntryID, userID)
}

func (s *TimeEntryService) AssignProjectToTime(timeEntryID int, projectID *int, userID string) ([]models.TimeEntry, error) {
	return s.timeEntryRepository.AssignProjectToTime(timeEntryID, projectID, userID)
}

package models

import "time"

type TimeEntry struct {
	ID          int       `json:"ID"`
	Name        string    `json:"Name"`
	Description string    `json:"Description"`
	ProjectID   *int      `json:"ProjectID"`
	StartDate   time.Time `json:"StartDate"`
	EndDate     time.Time `json:"EndDate"`
}

type TimeEntryCreate struct {
	Name        string    `json:"Name"`
	Description string    `json:"Description"`
	ProjectID   *int      `json:"ProjectID"`
	StartDate   time.Time `json:"StartDate"`
	EndDate     time.Time `json:"EndDate"`
}

// swagger:model
type AssignProjectPayload struct {
	ProjectID *int `json:"ProjectID"`
}

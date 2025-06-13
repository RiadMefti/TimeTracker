package models

import "time"

type TimeBoxEntry struct {
	ID          int       `json:"ID"`
	Description string    `json:"Description"`
	ProjectID   *int      `json:"ProjectID"`
	StartDate   time.Time `json:"StartDate"`
	EndDate     time.Time `json:"EndDate"`
}

type TimeBoxEntryCreate struct {
	Description string    `json:"Description"`
	ProjectID   *int      `json:"ProjectID"`
	StartDate   time.Time `json:"StartDate"`
	EndDate     time.Time `json:"EndDate"`
}



package models

type Project struct {
	ID          int    `json:"ID"`
	Name        string `json:"Name"`
	Description string `json:"Description"`
	Color       string `json:"Color"`
}

type ProjectCreate struct {
	Name        string `json:"Name"`
	Description string `json:"Description"`
	Color       string `json:"Color"`
}

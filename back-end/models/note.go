package models

import "time"

type Folder struct {
	ID       int       `json:"ID"`
	Name     string    `json:"Name"`
	ParentID *int      `json:"ParentID,omitempty"` // nil for root folders
	UserID   string    `json:"UserID"`
	Created  time.Time `json:"Created"`
	Updated  time.Time `json:"Updated"`
}

type FolderCreate struct {
	Name     string `json:"Name"`
	ParentID *int   `json:"ParentID,omitempty"`
}

type FolderUpdate struct {
	Name     string `json:"Name"`
	ParentID *int   `json:"ParentID,omitempty"`
}

type Note struct {
	ID       int       `json:"ID"`
	Title    string    `json:"Title"`
	Content  string    `json:"Content"` // TipTap JSON content
	FolderID *int      `json:"FolderID,omitempty"` // nil for root notes
	UserID   string    `json:"UserID"`
	Created  time.Time `json:"Created"`
	Updated  time.Time `json:"Updated"`
}

type NoteCreate struct {
	Title    string `json:"Title"`
	Content  string `json:"Content"`
	FolderID *int   `json:"FolderID,omitempty"`
}

type NoteUpdate struct {
	Title    string `json:"Title"`
	Content  string `json:"Content"`
	FolderID *int   `json:"FolderID,omitempty"`
}

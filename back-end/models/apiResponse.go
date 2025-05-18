package models

type ApiResponse[T any] struct {
	Success bool   `json:"Success"`
	Data    T      `json:"Data,omitempty"`
	Message string `json:"Message,omitempty"`
}

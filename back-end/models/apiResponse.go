package models

type ApiResponse[T any] struct {
	Success bool   `json:"Success"`
	Data    T      `json:"Data,omitempty"`
	Message string `json:"Message,omitempty"`
}

type ApiErrorResponse struct {
	Success bool   `json:"Success"`
	Message string `json:"Message,omitempty"`
}

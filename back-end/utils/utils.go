package utils

import (
	"os"

	"github.com/RiadMefti/TimeTracker/back-end/models"
)

func GetEnv(envVar string, fallback string) string {

	value, exists := os.LookupEnv(envVar)

	if exists {
		return value
	}
	return fallback

}

func CreateApiResponse[T any](success bool, data T, message string) models.ApiResponse[T] {
	return models.ApiResponse[T]{
		Success: success,
		Data:    data,
		Message: message,
	}
}

package utils

import (
	"os"

	"firebase.google.com/go/auth"
	"github.com/RiadMefti/TimeTracker/back-end/models"
	"github.com/gofiber/fiber/v2"
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

func GetUserOrAbort(c *fiber.Ctx) (*auth.UserRecord, bool) {
	userAuth, ok := c.Locals("user").(*auth.UserRecord)
	if !ok || userAuth == nil {
		c.Status(fiber.StatusUnauthorized).JSON(CreateApiResponse[interface{}](false, nil, "Can not find the user"))
		return nil, false
	}
	return userAuth, true
}

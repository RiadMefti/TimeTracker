package controllers

import (
	"firebase.google.com/go/auth"
	"github.com/RiadMefti/TimeTracker/back-end/models"
	"github.com/RiadMefti/TimeTracker/back-end/services"
	"github.com/gofiber/fiber/v2"
)

type AuthController struct {
	authService *services.AuthService
}

func NewAuthController(authService *services.AuthService) *AuthController {
	return &AuthController{
		authService: authService,
	}
}

// @Summary Create or log a user
// @Description Create or log a user
// @Tags auth
// @Produce plain
// @Success 201 {string} string "user Created"
// @Success 200 {string} string "user Exists"
// @Failure 401 {string} string "user not found"
// @Failure 500 {string} string "error message"
// @Router /auth/login [post]
func (u *AuthController) LoginUser(ctx *fiber.Ctx) error {

	user, ok := ctx.Locals("user").(*auth.UserRecord)

	if !ok || user == nil {
		return ctx.Status(fiber.StatusUnauthorized).SendString("user not found")

	}
	created, err := u.authService.RegisterUser(models.User{
		ID:    user.UID,
		Email: user.Email,
	})

	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).SendString(err.Error())
	}
	if created {
		return ctx.Status(fiber.StatusCreated).SendString("user Created")
	}
	return ctx.Status(fiber.StatusOK).SendString("user Exists")
}

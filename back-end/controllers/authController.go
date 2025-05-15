package controllers

import (
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

// CreateUser handles POST /login
// @Summary Create a new user
// @Description Create a new user with email
// @Tags Users
// @Accept json
// @Produce json
// @Param user body models.CreateUserRequest true "User information"
// @Success 201 {object} models.User
// @Failure 400 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /auth [post]
func (u *AuthController) LoginUser(ctx *fiber.Ctx) error {
	var user models.User
	err := ctx.BodyParser(&user)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return u.authService.RegisterUser(user)
}

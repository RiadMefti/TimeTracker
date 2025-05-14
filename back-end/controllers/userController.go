package controllers

import (
	"github.com/RiadMefti/TimeTracker/back-end/services"
	"github.com/gofiber/fiber/v2"
)

type UserController struct {
	userService *services.UserService
}

func NewUserController(userService *services.UserService) *UserController {
	return &UserController{
		userService: userService,
	}
}

// CreateUser handles POST /users
// @Summary Create a new user
// @Description Create a new user with email
// @Tags Users
// @Accept json
// @Produce json
// @Param user body models.CreateUserRequest true "User information"
// @Success 201 {object} models.User
// @Failure 400 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /users [post]
func (u *UserController) CreateUser(ctx *fiber.Ctx) error {
	var body struct {
		Email string `json:"email"`
	}
	err := ctx.BodyParser(&body)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return u.userService.CreateUser(body.Email)
}

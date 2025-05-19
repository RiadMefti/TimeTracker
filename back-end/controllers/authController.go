package controllers

import (
	"github.com/RiadMefti/TimeTracker/back-end/models"
	"github.com/RiadMefti/TimeTracker/back-end/services"
	"github.com/RiadMefti/TimeTracker/back-end/utils"
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
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 201 {object} models.ApiResponse[models.User] "user Created"
// @Success 200 {object} models.ApiResponse[models.User] "user Exists"
// @Failure 401 {object} models.ApiErrorResponse "user not found"
// @Failure 500 {object} models.ApiErrorResponse "error message"
// @Router /auth/login [post]
func (u *AuthController) LoginUser(c *fiber.Ctx) error {
	userAuth, ok := utils.GetUserOrAbort(c)
	if !ok {
		return nil
	}

	user := models.User{
		ID:    userAuth.UID,
		Email: userAuth.Email,
	}

	created, err := u.authService.RegisterUser(user)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(utils.CreateApiResponse[interface{}](false, nil, "Error while creating user"))
	}
	if created {
		return c.Status(fiber.StatusCreated).JSON(utils.CreateApiResponse(true, user, "user Created"))
	}
	return c.Status(fiber.StatusOK).JSON(utils.CreateApiResponse(true, user, "user Exists and logged in"))
}

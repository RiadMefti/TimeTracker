package routes

import (
	"github.com/RiadMefti/TimeTracker/back-end/controllers"
	"github.com/gofiber/fiber/v2"
)

func SetupAuthRoutes(app *fiber.App, controller *controllers.AuthController) {
	auth := app.Group("/auth")

	auth.Post("/login", controller.LoginUser)
}

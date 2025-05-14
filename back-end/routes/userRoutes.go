package routes

import (
	"github.com/RiadMefti/TimeTracker/back-end/controllers"
	"github.com/gofiber/fiber/v2"
)

func SetupUserRoutes(app *fiber.App, controller *controllers.UserController) {
	users := app.Group("/users")

	users.Post("/", controller.CreateUser)
}

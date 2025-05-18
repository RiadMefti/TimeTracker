package routes

import (
	"github.com/RiadMefti/TimeTracker/back-end/controllers"
	"github.com/gofiber/fiber/v2"
)

func SetupProjectRoutes(c *fiber.App, controller *controllers.ProjectController) {

	group := c.Group("/projects")

	group.Get("/", controller.GetUserProjects)
	group.Post("/", controller.CreateUserProject)
	group.Put("/", controller.UpdateUserProject)
	group.Delete("/:id", controller.DeleteUserProject)

}

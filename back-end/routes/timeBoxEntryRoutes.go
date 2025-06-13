package routes

import (
	"github.com/RiadMefti/TimeTracker/back-end/controllers"
	"github.com/gofiber/fiber/v2"
)

func SetupTimeBoxEntryRoutes(app *fiber.App, controller *controllers.TimeBoxEntryController) {
	group := app.Group("/time-box-entries")

	group.Get("/", controller.GetUserTimeBoxEntries)
	group.Post("/", controller.CreateTimeBoxEntry)
	group.Put("/", controller.UpdateTimeBoxEntry)
	group.Delete("/:id", controller.DeleteTimeBoxEntry)
	group.Patch("/:id/assign-project", controller.AssignProjectToTimeBox)
}

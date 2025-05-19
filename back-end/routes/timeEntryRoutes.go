package routes

import (
	"github.com/RiadMefti/TimeTracker/back-end/controllers"
	"github.com/gofiber/fiber/v2"
)

func SetupTimeEntryRoutes(app *fiber.App, controller *controllers.TimeEntryController) {
	group := app.Group("/time-entries")

	group.Get("/", controller.GetUserTimeEntries)
	group.Post("/", controller.CreateTimeEntry)
	group.Put("/", controller.UpdateTimeEntry)
	group.Delete("/:id", controller.DeleteTimeEntry)
	group.Patch("/:id/assign-project", controller.AssignProjectToTime)
}

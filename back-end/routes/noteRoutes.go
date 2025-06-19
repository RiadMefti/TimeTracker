package routes

import (
	"github.com/RiadMefti/TimeTracker/back-end/controllers"
	"github.com/gofiber/fiber/v2"
)

func SetupNoteRoutes(app *fiber.App, controller *controllers.NoteController) {
	notes := app.Group("/notes")

	notes.Post("/", controller.CreateNote)
	notes.Get("/", controller.GetAllNotes)
	notes.Get("/by-folder", controller.GetNotesByFolder)
	notes.Get("/:id", controller.GetNote)
	notes.Put("/:id", controller.UpdateNote)
	notes.Delete("/:id", controller.DeleteNote)
}

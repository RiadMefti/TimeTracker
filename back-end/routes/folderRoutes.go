package routes

import (
	"github.com/RiadMefti/TimeTracker/back-end/controllers"
	"github.com/gofiber/fiber/v2"
)

func SetupFolderRoutes(app *fiber.App, controller *controllers.FolderController) {
	folders := app.Group("/folders")

	folders.Post("/", controller.CreateFolder)
	folders.Get("/", controller.GetAllFolders)
	folders.Get("/by-parent", controller.GetFoldersByParent)
	folders.Get("/:id", controller.GetFolder)
	folders.Put("/:id", controller.UpdateFolder)
	folders.Delete("/:id", controller.DeleteFolder)
}

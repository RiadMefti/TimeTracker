package main

import (
	"github.com/gofiber/fiber/v2"

	// Import the generated docs file
	_ "github.com/RiadMefti/TimeTracker/back-end/docs" // Import your module's docs

	swagger "github.com/arsmn/fiber-swagger/v2"
)

// @title TimeTracker Back-end API
// @version 1.0
// @description This is the back-end API for the TimeTracker application.
// @host localhost:3000
// @BasePath /
func main() {
	app := fiber.New()

	// Hello World endpoint
	app.Get("/hello", getHelloHandler)

	// Swagger endpoint
	app.Get("/swagger/*", swagger.HandlerDefault)

	// Start the server
	err := app.Listen(":3000")
	if err != nil {
		panic(err)
	}
}

// @Summary Get a simple greeting
// @Description Returns a "Hello, World!" string
// @Tags Greeting
// @Accept  json
// @Produce plain
// @Success 200 {string} string "Success"
// @Router /hello [get]
func getHelloHandler(c *fiber.Ctx) error {
	return c.SendString("Hello, World!")
}

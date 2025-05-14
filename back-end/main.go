package main

import (
	// Import the generated docs file for Swagger documentation
	"log"

	"github.com/RiadMefti/TimeTracker/back-end/app"
	_ "github.com/RiadMefti/TimeTracker/back-end/docs"
)

// @title TimeTracker Back-end API
// @version 1.0
// @description This is the back-end API for the TimeTracker application.
// @host localhost:3000
// @BasePath /
func main() {
	err := app.RunApp()
	if err != nil {
		log.Fatal(err)
	}
}

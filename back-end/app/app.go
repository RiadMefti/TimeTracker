package app

import (
	"log"

	"github.com/RiadMefti/TimeTracker/back-end/controllers"
	"github.com/RiadMefti/TimeTracker/back-end/db"
	"github.com/RiadMefti/TimeTracker/back-end/repositories"
	"github.com/RiadMefti/TimeTracker/back-end/routes"
	"github.com/RiadMefti/TimeTracker/back-end/services"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"

	// Import the generated docs file for Swagger documentation
	_ "github.com/RiadMefti/TimeTracker/back-end/docs"

	swagger "github.com/arsmn/fiber-swagger/v2"
)

func RunApp() error {

	//init app
	app := fiber.New()

	//middleware

	app.Use(logger.New())
	app.Use(recover.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "*",
		AllowMethods:     "GET,POST,PUT,DELETE,OPTIONS,PATCH",
		AllowHeaders:     "Accept,Authorization,Content-Type",
		AllowCredentials: false,
		MaxAge:           300,
	}))

	//Create Db

	db, err := db.InitDb()

	if err != nil {
		return err
	}

	//repositories
	userRepository := repositories.NewUserRepository(db)

	//services
	userService := services.NewUserService(userRepository)

	//controllers

	userController := controllers.NewUserController(userService)

	//routes
	routes.SetupUserRoutes(app, userController)

	// Swagger endpoint
	app.Get("/swagger/*", swagger.HandlerDefault)

	app.Get("/hello", func(c *fiber.Ctx) error {
		return c.SendString("Goodbye, World!!")
	})
	log.Println("Starting server on port 3000")
	errStart := app.Listen(":3000")
	if errStart != nil {
		return err
	}

	return nil

}

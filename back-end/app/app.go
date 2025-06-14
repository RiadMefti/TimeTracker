package app

import (
	"log"

	"github.com/RiadMefti/TimeTracker/back-end/controllers"
	"github.com/RiadMefti/TimeTracker/back-end/db"
	"github.com/RiadMefti/TimeTracker/back-end/middleware"
	"github.com/RiadMefti/TimeTracker/back-end/repositories"
	"github.com/RiadMefti/TimeTracker/back-end/routes"
	"github.com/RiadMefti/TimeTracker/back-end/services"
	"github.com/RiadMefti/TimeTracker/back-end/utils"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"

	_ "github.com/RiadMefti/TimeTracker/back-end/docs"

	swagger "github.com/arsmn/fiber-swagger/v2"
)

func RunApp() error {

	//init app
	app := fiber.New()

	//Create Db

	db, err := db.InitDb()

	if err != nil {
		return err
	}
	defer db.Close()
	//repositories
	userRepository := repositories.NewUserRepository(db)
	projectRepository := repositories.NewProjectRepository(db)
	timeEntryRepository := repositories.NewTimeEntryRepository(db)
	timeBoxEntryRepository := repositories.NewTimeBoxEntryRepository(db)

	//services
	authService := services.NewAuthService(userRepository)
	projectService := services.NewProjectService(projectRepository)
	timeEntryService := services.NewTimeEntryService(timeEntryRepository)
	timeBoxEntryService := services.NewTimeBoxEntryService(timeBoxEntryRepository)	

	firebaseService, err := services.NewFirebaseService()
	if err != nil {
		return err
	}

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
	// Swagger endpoint before
	app.Get("/swagger/*", swagger.HandlerDefault)

	app.Use(middleware.AuthorizationMiddleware(firebaseService))

	//controllers

	authController := controllers.NewAuthController(authService)
	projectController := controllers.NewProjectController(projectService)
	timeEntryController := controllers.NewTimeEntryController(timeEntryService)
	timeBoxEntryController := controllers.NewTimeBoxEntryController(timeBoxEntryService)

	//routes
	routes.SetupAuthRoutes(app, authController)
	routes.SetupProjectRoutes(app, projectController)
	routes.SetupTimeEntryRoutes(app, timeEntryController)
	routes.SetupTimeBoxEntryRoutes(app, timeBoxEntryController)
	app.Get("/hello", func(c *fiber.Ctx) error {
		return c.Status(fiber.StatusOK).JSON(utils.CreateApiResponse(true, "hello from server", "hello sent successfully"))
	})
	log.Println("Starting server on port 3000")
	errStart := app.Listen(":3000")
	if errStart != nil {
		return err
	}

	return nil

}

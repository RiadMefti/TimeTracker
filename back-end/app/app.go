package app

import (
	"context"
	"log"
	"strings"

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
	authService := services.NewAuthService(userRepository)
	firebaseService, err := services.NewFirebaseService()
	if err != nil {
		return err
	}
	//controllers

	authController := controllers.NewAuthController(authService)

	//routes
	routes.SetupAuthRoutes(app, authController)

	// Swagger endpoint
	app.Get("/swagger/*", swagger.HandlerDefault)

	app.Get("/hello", func(c *fiber.Ctx) error {
		ctx := context.Background()
		client, err := firebaseService.Auth(ctx)
		if err != nil {
			return err
		}
		header := c.GetReqHeaders()
		authHeader := header["Authorization"][0]
		authBearer := strings.Split(authHeader, " ")[1]
		token, err := client.VerifyIDToken(ctx, authBearer)
		return c.SendString(token.UID)
	})
	log.Println("Starting server on port 3000")
	errStart := app.Listen(":3000")
	if errStart != nil {
		return err
	}

	return nil

}

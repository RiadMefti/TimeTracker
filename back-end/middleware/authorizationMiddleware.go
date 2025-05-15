package middleware

import (
	"context"
	"strings"

	firebase "firebase.google.com/go"
	"github.com/gofiber/fiber/v2"
)

func AuthorizationMiddleware(firebaseService *firebase.App) fiber.Handler {

	return func(c *fiber.Ctx) error {
		ctx := context.Background()
		client, err := firebaseService.Auth(ctx)
		if err != nil {
			panic(err)
		}
		header := c.GetReqHeaders()
		authHeader := header["Authorization"]
		if len(authHeader) == 0 {
			return c.Status(fiber.StatusUnauthorized).SendString("Missing Authorization header")

		}
		parts := strings.Split(authHeader[0], " ")
		if len(parts) != 2 {
			return c.Status(fiber.StatusUnauthorized).SendString("Invalid Authorization header format")

		}
		_, err = client.VerifyIDToken(ctx, parts[1])
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).SendString("Unauthorized")

		}
		return c.Next()
	}
}

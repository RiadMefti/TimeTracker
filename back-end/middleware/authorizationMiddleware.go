package middleware

import (
	"context"
	"strings"

	firebase "firebase.google.com/go"
	"github.com/RiadMefti/TimeTracker/back-end/utils"
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

			return c.Status(fiber.StatusUnauthorized).JSON(utils.CreateApiResponse[interface{}](false, nil, "Missing Authorization header"))

		}
		parts := strings.Split(authHeader[0], " ")
		if len(parts) != 2 {
			return c.Status(fiber.StatusUnauthorized).JSON(utils.CreateApiResponse[interface{}](false, nil, "Invalid Authorization header format"))

		}
		uidToken, err := client.VerifyIDToken(ctx, parts[1])
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(utils.CreateApiResponse[interface{}](false, nil, "Unauthorized"))

		}

		user, err := client.GetUser(ctx, uidToken.UID)
		if err != nil {

			return c.Status(fiber.StatusUnauthorized).JSON(utils.CreateApiResponse[interface{}](false, nil, "Can not find the user"))

		}

		c.Locals("user", user)
		c.Locals("userID", uidToken.UID)
		return c.Next()
	}
}

package services

import (
	"context"
	"fmt"
	"os"

	firebase "firebase.google.com/go"
	"google.golang.org/api/option"
)

func NewFirebaseService() (*firebase.App, error) {
	// Check if key.json file exists
	if _, err := os.Stat("key.json"); err == nil {
		// Use credentials file if it exists
		opt := option.WithCredentialsFile("key.json")
		app, err := firebase.NewApp(context.Background(), nil, opt)
		if err != nil {
			return nil, fmt.Errorf("error initializing app with credentials file: %v", err)
		}
		return app, nil
	}

	// If key.json doesn't exist, use environment variable
	credentialsJSON := os.Getenv("FIREBASE_CREDENTIALS")
	if credentialsJSON == "" {
		return nil, fmt.Errorf("FIREBASE_CREDENTIALS environment variable is not set")
	}

	// Use credentials JSON
	opt := option.WithCredentialsJSON([]byte(credentialsJSON))
	app, err := firebase.NewApp(context.Background(), nil, opt)
	if err != nil {
		return nil, fmt.Errorf("error initializing app with environment variables: %v", err)
	}

	return app, nil
}

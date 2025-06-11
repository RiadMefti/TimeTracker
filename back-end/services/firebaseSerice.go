package services

import (
	"context"
	"fmt"
	"os"

	firebase "firebase.google.com/go"
	"google.golang.org/api/option"
)

func NewFirebaseService() (*firebase.App, error) {

	var opt option.ClientOption

	// Option 2: Use FIREBASE_CREDENTIALS_JSON environment variable
	// This should contain the entire JSON content as a string
	credentialsJSON := os.Getenv("FIREBASE_CREDENTIALS_JSON")
	if credentialsJSON != "" {
		opt = option.WithCredentialsJSON([]byte(credentialsJSON))
	} else {
		return nil, fmt.Errorf("firebase credentials not found. Set either GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_CREDENTIALS_JSON environment variable")
	}

	app, err := firebase.NewApp(context.Background(), nil, opt)
	if err != nil {
		return nil, fmt.Errorf("error initializing app: %v", err)
	}

	return app, nil
}

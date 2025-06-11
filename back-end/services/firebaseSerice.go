package services

import (
	"context"
	"encoding/json"
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

	// If key.json doesn't exist, use environment variables
	credentialsMap := map[string]string{
		"type":                        os.Getenv("FIREBASE_TYPE"),
		"project_id":                  os.Getenv("FIREBASE_PROJECT_ID"),
		"private_key_id":              os.Getenv("FIREBASE_PRIVATE_KEY_ID"),
		"private_key":                 os.Getenv("FIREBASE_PRIVATE_KEY"),
		"client_email":                os.Getenv("FIREBASE_CLIENT_EMAIL"),
		"client_id":                   os.Getenv("FIREBASE_CLIENT_ID"),
		"auth_uri":                    os.Getenv("FIREBASE_AUTH_URI"),
		"token_uri":                   os.Getenv("FIREBASE_TOKEN_URI"),
		"auth_provider_x509_cert_url": os.Getenv("FIREBASE_AUTH_PROVIDER_X509_CERT_URL"),
		"client_x509_cert_url":        os.Getenv("FIREBASE_CLIENT_X509_CERT_URL"),
		"universe_domain":             os.Getenv("FIREBASE_UNIVERSE_DOMAIN"),
	}

	// Check if required environment variables are set
	if credentialsMap["type"] == "" || credentialsMap["project_id"] == "" || credentialsMap["private_key"] == "" || credentialsMap["client_email"] == "" {
		return nil, fmt.Errorf("missing required Firebase environment variables")
	}

	// Convert map to JSON
	credentialsJSON, err := json.Marshal(credentialsMap)
	if err != nil {
		return nil, fmt.Errorf("error marshaling credentials: %v", err)
	}

	// Use credentials JSON
	opt := option.WithCredentialsJSON(credentialsJSON)
	app, err := firebase.NewApp(context.Background(), nil, opt)
	if err != nil {
		return nil, fmt.Errorf("error initializing app with environment variables: %v", err)
	}

	return app, nil
}

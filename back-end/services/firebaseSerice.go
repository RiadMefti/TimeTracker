package services

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"strings"

	firebase "firebase.google.com/go"
	"google.golang.org/api/option"
)

func NewFirebaseService() (*firebase.App, error) {

	var opt option.ClientOption

	// Option 2: Use FIREBASE_CREDENTIALS_JSON environment variable
	// This should contain the entire JSON content as a string
	credentialsJSON := os.Getenv("FIREBASE_CREDENTIALS_JSON")
	if credentialsJSON != "" {
		// Handle multiple layers of escaping that can occur in deployment platforms
		// First, handle double-escaped newlines (\\n -> \n)
		credentialsJSON = strings.ReplaceAll(credentialsJSON, "\\\\n", "\\n")
		// Then handle single-escaped newlines (\n -> actual newlines)
		credentialsJSON = strings.ReplaceAll(credentialsJSON, "\\n", "\n")
		// Handle escaped quotes if any
		credentialsJSON = strings.ReplaceAll(credentialsJSON, "\\\"", "\"")
		
		// Validate JSON before using it
		var temp map[string]interface{}
		if err := json.Unmarshal([]byte(credentialsJSON), &temp); err != nil {
			return nil, fmt.Errorf("invalid JSON in FIREBASE_CREDENTIALS_JSON: %v", err)
		}
		
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

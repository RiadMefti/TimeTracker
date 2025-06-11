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
		// Handle different escaping scenarios from deployment platforms
		// Try to parse as-is first
		var temp map[string]interface{}
		err := json.Unmarshal([]byte(credentialsJSON), &temp)
		
		// If parsing fails, try fixing double-escaped characters
		if err != nil {
			// Handle double-escaped newlines (\\n -> \n) - keep as escaped for JSON
			credentialsJSON = strings.ReplaceAll(credentialsJSON, "\\\\n", "\\n")
			// Handle double-escaped quotes (\\\" -> \")
			credentialsJSON = strings.ReplaceAll(credentialsJSON, "\\\\\"", "\\\"")
			
			// Try parsing again
			err = json.Unmarshal([]byte(credentialsJSON), &temp)
		}
		
		// If still failing, the JSON is invalid
		if err != nil {
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

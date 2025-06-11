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

	// Try individual environment variables first (cleaner approach)
	projectID := os.Getenv("FIREBASE_PROJECT_ID")
	privateKeyID := os.Getenv("FIREBASE_PRIVATE_KEY_ID")
	privateKey := os.Getenv("FIREBASE_PRIVATE_KEY")
	clientEmail := os.Getenv("FIREBASE_CLIENT_EMAIL")
	clientID := os.Getenv("FIREBASE_CLIENT_ID")

	if projectID != "" && privateKeyID != "" && privateKey != "" && clientEmail != "" && clientID != "" {
		// Build credentials JSON from individual environment variables
		credentials := map[string]interface{}{
			"type":                        "service_account",
			"project_id":                  projectID,
			"private_key_id":              privateKeyID,
			"private_key":                 privateKey,
			"client_email":                clientEmail,
			"client_id":                   clientID,
			"auth_uri":                    "https://accounts.google.com/o/oauth2/auth",
			"token_uri":                   "https://oauth2.googleapis.com/token",
			"auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
			"client_x509_cert_url":        fmt.Sprintf("https://www.googleapis.com/robot/v1/metadata/x509/%s", strings.ReplaceAll(clientEmail, "@", "%40")),
			"universe_domain":             "googleapis.com",
		}

		credentialsJSON, err := json.Marshal(credentials)
		if err != nil {
			return nil, fmt.Errorf("error marshaling Firebase credentials: %v", err)
		}

		opt = option.WithCredentialsJSON(credentialsJSON)
	} else {
		// Fallback to FIREBASE_CREDENTIALS_JSON environment variable
		credentialsJSON := os.Getenv("FIREBASE_CREDENTIALS_JSON")
		if credentialsJSON != "" {
			// Handle different escaping scenarios from deployment platforms
			var temp map[string]interface{}
			err := json.Unmarshal([]byte(credentialsJSON), &temp)

			// If parsing fails, try fixing different escaping scenarios
			if err != nil {
				// First, try handling literal newlines by escaping them
				credentialsJSON = strings.ReplaceAll(credentialsJSON, "\n", "\\n")

				// Try parsing again
				err = json.Unmarshal([]byte(credentialsJSON), &temp)

				// If still failing, try handling double-escaped characters
				if err != nil {
					// Handle double-escaped newlines (\\n -> \n) - keep as escaped for JSON
					credentialsJSON = strings.ReplaceAll(credentialsJSON, "\\\\n", "\\n")
					// Handle double-escaped quotes (\\\" -> \")
					credentialsJSON = strings.ReplaceAll(credentialsJSON, "\\\\\"", "\\\"")

					// Try parsing again
					err = json.Unmarshal([]byte(credentialsJSON), &temp)
				}
			}

			// If still failing, the JSON is invalid
			if err != nil {
				return nil, fmt.Errorf("invalid JSON in FIREBASE_CREDENTIALS_JSON: %v", err)
			}

			opt = option.WithCredentialsJSON([]byte(credentialsJSON))
		} else {
			return nil, fmt.Errorf("firebase credentials not found. Set either individual environment variables (FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, FIREBASE_CLIENT_ID) or FIREBASE_CREDENTIALS_JSON")
		}
	}

	app, err := firebase.NewApp(context.Background(), nil, opt)
	if err != nil {
		return nil, fmt.Errorf("error initializing app: %v", err)
	}

	return app, nil
}

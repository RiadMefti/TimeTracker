package utils

import "os"

func GetEnv(envVar string, fallback string) string {

	value, exists := os.LookupEnv(envVar)

	if exists {
		return value
	}
	return fallback

}

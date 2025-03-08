package config

import (
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	Port       int
	DB_URL     string
	JWT_SECRET string
}

func LoadConfig() Config {
	if os.Getenv("ENV") != "production" {
		_ = godotenv.Load()
	}

	port, err := strconv.Atoi(getEnv("PORT", "8080"))
	if err != nil {
		log.Fatal("Invalid PORT: ", err)
	}

	return Config{
		Port:       port,
		DB_URL:     getEnv("DB_URL", "postgres://user:password@localhost:5432/mydb"),
		JWT_SECRET: getEnv("JWT_SECRET", "ur-kept-secret"),
	}
}

// Helper functions
func getEnv(key, defaultValue string) string {
	value, exists := os.LookupEnv(key)
	if !exists || value == "" {
		return defaultValue
	}
	return value
}

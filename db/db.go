package db

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/lib/pq"
	"github.com/rvif/nano-url/internal/config"
)

var DB *sql.DB

func InitDB() error {
	cfg := config.LoadConfig()

	// connect to the database
	var err error
	DB, err = sql.Open("postgres", cfg.DB_URL)
	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}

	log.Println("Successfully connected to database")

	// ping the database
	if err := DB.Ping(); err != nil {
		return fmt.Errorf("error pinging database: %v", err)
	}
	log.Println("Successfully pinged database")

	// Apply migrations in production
	if os.Getenv("ENV") == "production" || os.Getenv("RUN_MIGRATIONS") == "true" {
		log.Println("Running database migrations...")
		if err := InitializeDatabase(DB); err != nil {
			return fmt.Errorf("failed to initialize database: %w", err)
		}
	}

	return nil
}

func GetDB() *sql.DB {
	return DB
}

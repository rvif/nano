package db

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/pressly/goose/v3"
)

func InitializeDatabase(db *sql.DB) error {
	log.Println("Setting up database migrations...")

	// set the Goose dialect to postgres
	if err := goose.SetDialect("postgres"); err != nil {
		return fmt.Errorf("failed to set goose dialect: %w", err)
	}

	// verify migrations directory exists
	migrationDir := "./db/migrations"
	if _, err := os.Stat(migrationDir); os.IsNotExist(err) {
		log.Printf("Warning: Migrations directory %s doesn't exist", migrationDir)
		// create the directory
		if err := os.MkdirAll(migrationDir, 0755); err != nil {
			return fmt.Errorf("failed to create migrations directory: %w", err)
		}
		log.Printf("Created migrations directory: %s", migrationDir)
		return nil // skip migrations since directory was just created
	}

	// apply migrations up
	log.Printf("Applying migrations from: %s", migrationDir)
	if err := goose.Up(db, migrationDir); err != nil {
		return fmt.Errorf("failed to apply migrations: %w", err)
	}

	log.Println("Successfully applied migrations")

	// wait for database to settle after migrations
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// verify database connectivity after migrations
	if err := db.PingContext(ctx); err != nil {
		return fmt.Errorf("database connection failed after migrations: %w", err)
	}

	log.Println("Database is ready")
	return nil
}

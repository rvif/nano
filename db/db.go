package db

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/lib/pq"
	"github.com/rvif/nano-url/internal/config"
)

var DB *sql.DB

func InitDB() {
	cfg := config.LoadConfig()

	// Connect to the database
	var err error
	DB, err = sql.Open("postgres", cfg.DB_URL)
	if err != nil {
		log.Fatalf("ERROR connecting to database: %v", err)
	}
	// defer DB.Close()
	fmt.Println("Successfully connected to database")

	// Ping the database
	if err := DB.Ping(); err != nil {
		log.Fatalf("ERROR pinging database: %v", err)
	}
	fmt.Println("Successfully pinged database")
}

func GetDB() *sql.DB {
	return DB
}

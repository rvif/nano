package main

import (
	"fmt"
	"log"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/rvif/nano-url/db"

	"github.com/rvif/nano-url/internal/handlers"
	"github.com/rvif/nano-url/internal/middleware"
	"github.com/rvif/nano-url/internal/services"
)

func main() {
	fmt.Println("Starting nano-url...")

	// Set production mode for Gin in production
	if os.Getenv("ENV") == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Log environment vars (sanitized for security)
	log.Printf("Environment: %s", os.Getenv("ENV"))
	log.Printf("PORT: %s", os.Getenv("PORT"))
	log.Printf("DB connection configured: %v", os.Getenv("DB_URL") != "")
	log.Printf("SMTP credentials configured: %v", os.Getenv("SMTP_USERNAME") != "" && os.Getenv("SMTP_PASSWORD") != "")

	// Connect to the database with error handling
	log.Println("Connecting to database...")
	err := db.InitDB()
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	log.Println("Database connection successful")

	// Load SMTP credentials from environment
	username := os.Getenv("SMTP_USERNAME")
	password := os.Getenv("SMTP_PASSWORD")
	log.Println("Initializing mailer...")
	handlers.InitMailer(username, password)

	log.Println("Initializing daily reset service...")

	// Initialize the daily reset service
	istLocation, err := time.LoadLocation("Asia/Kolkata")
	if err != nil {
		log.Printf("Error loading IST timezone: %v. Using local timezone instead.", err)
		istLocation = time.Local
	} else {
		log.Printf("Successfully loaded IST timezone: %v", istLocation)
	}

	// Daily clicks will reset on 12:00 AM IST
	dailyResetService := services.NewDailyResetService(istLocation)
	dailyResetService.Start()

	// Start the server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port: %s", port)

	router := gin.Default()

	allowedOrigins := []string{"http://localhost:5173"}
	if os.Getenv("ENV") == "production" {
		allowedOrigins = append(
			allowedOrigins,
			"https://url-shortener-frontend-1218228353.asia-south1.run.app",
			"https://url-shortener-frontend-1218228353.run.app",
			"https://nano-khaki.vercel.app",
		)
	}

	router.Use(cors.New(cors.Config{
		AllowOrigins:     allowedOrigins,
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Ensure the public/images directory exists
	if err := os.MkdirAll("./public/images", 0755); err != nil {
		log.Printf("Error creating public/images directory: %v", err)
	}

	// DEBUG: List all files in the public/images directory
	files, err := os.ReadDir("./public/images")
	if err != nil {
		log.Printf("Error reading public/images directory: %v", err)
	} else {
		log.Println("Files in public/images directory:")
		for _, file := range files {
			log.Printf("  - %s", file.Name())
		}
	}

	// Serving static files first
	// Serve static files from public directory
	router.Static("/images", "./public/images")
	log.Printf("Serving static files from ./public/images")

	// test path endpoint after the static route to check if it's static files are working
	router.GET("/api/v1/test-path", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "Static file paths are working"})
	})

	// Routes configuration
	v1Router := router.Group("/api/v1")
	{
		auth := v1Router.Group("/auth")
		{
			auth.POST("/register", handlers.RegisterHandler)
			auth.POST("/login", handlers.LoginHandler)
			auth.POST("/forgot-password", handlers.ForgotPasswordHandler)
			auth.POST("/reset-password", handlers.ResetPasswordHandler)
			auth.POST("/refresh-token", handlers.RefreshTokenHandler)
		}

		// Protected routes
		protected := v1Router.Group("")
		protected.Use(middleware.AuthMiddleware())
		protected.GET("/me", handlers.MeHandler)

		// URL shortener routes
		url := protected.Group("/url")
		{
			url.POST("/shorten", handlers.CreateURLHandler)
			url.POST("/get-urls", handlers.GetURLSByUserIDHandler)
			url.POST("/update/:url_id", handlers.UpdateShortURLHandler)
			url.POST("/delete/:short_url", handlers.DeleteURLHandler)
			url.POST("/analytics/:short_url", handlers.GetURLAnalyticsHandler)
		}
		protected.GET("/analytics", handlers.GetMyAnalyticsHandler)

		v1Router.GET("/url/:slug", handlers.RedirectToURLHandler)
		v1Router.GET("/health", handlers.HealthCheckHandler)
		v1Router.GET("/", func(c *gin.Context) {
			c.JSON(200, gin.H{"message": "Welcome to nano-url"})
		})
	}

	// Start the server with explicit address
	address := "0.0.0.0:" + port
	log.Printf("Binding to address: %s", address)

	err = router.Run(address)
	if err != nil {
		log.Fatalf("ERROR starting server: %v", err)
	}
}

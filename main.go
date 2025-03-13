package main

import (
	"fmt"
	"log"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/rvif/nano-url/db"
	"github.com/rvif/nano-url/internal/config"
	"github.com/rvif/nano-url/internal/handlers"
	"github.com/rvif/nano-url/internal/middleware"
	"github.com/rvif/nano-url/internal/services"
)

func main() {
	fmt.Println("Starting nano-url...")
	cfg := config.LoadConfig()
	// Connect to the database
	db.InitDB()

	// Load SMTP credentials from .env
	username := os.Getenv("SMTP_USERNAME")
	password := os.Getenv("SMTP_PASSWORD")
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
	fmt.Println("Server starting on port: ", cfg.Port)
	router := gin.Default()

	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Serve static files
	router.Static("/images", "./public/images")

	// !!!#### Rooooter and Roooootes ####!!!
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

	// Blocking call
	err = router.Run(fmt.Sprintf(":%v", cfg.Port))
	if err != nil {
		log.Fatalf("ERROR starting server: %v", err)
	}
}

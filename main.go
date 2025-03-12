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
)

func main() {
	cfg := config.LoadConfig()
	// Connect to the database
	db.InitDB()

	// Load SMTP credentials from .env
	username := os.Getenv("SMTP_USERNAME")
	password := os.Getenv("SMTP_PASSWORD")
	handlers.InitMailer(username, password)

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

		// TODO: add url shortener routes on protected group
		url := protected.Group("/url")
		{
			// URLs -> shortURLs
			url.POST("/shorten", handlers.CreateURLHandler)
			// url.GET("/my-links", handlers.GetURLsByUserIDHandler)
			// url.PATCH("/update/:short_url", handlers.UpdateShortURLHandler)
			// url.DELETE("/delete/:short_url", handlers.DeleteURLHandler)
			// url.GET("/analytics/:short_url", handlers.GetURLAnalyticsHandler)

		}

		v1Router.GET("/url/:slug", handlers.RedirectToURLHandler)
		v1Router.GET("/health", handlers.HealthCheckHandler)
		v1Router.GET("/", func(c *gin.Context) {
			c.JSON(200, gin.H{"message": "Welcome to nano-url"})
		})
	}

	// Blocking call
	err := router.Run(fmt.Sprintf(":%v", cfg.Port))
	if err != nil {
		log.Fatalf("ERROR starting server: %v", err)
	}
}

package handlers

import (
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/rvif/nano-url/db"
)

type ServiceStatus struct {
	Status  string `json:"status"`
	Message string `json:"message,omitempty"`
}

func HealthCheckHandler(c *gin.Context) {
	healthStatus := map[string]ServiceStatus{}

	// server status
	healthStatus["server"] = ServiceStatus{
		Status:  "healthy",
		Message: "API server is responding",
	}

	// db connection
	dbConn := db.GetDB()
	if dbConn == nil {
		healthStatus["database"] = ServiceStatus{
			Status:  "unavailable",
			Message: "Database connection not initialized",
		}
	} else {
		if err := dbConn.Ping(); err != nil {
			healthStatus["database"] = ServiceStatus{
				Status:  "unhealthy",
				Message: "Database connection failed",
			}
		} else {
			healthStatus["database"] = ServiceStatus{
				Status:  "healthy",
				Message: "Database connection successful",
			}
		}
	}

	// auth configuration
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" || jwtSecret == "ur-kept-secret" {
		healthStatus["auth"] = ServiceStatus{
			Status:  "warning",
			Message: "JWT_SECRET using default value or not set",
		}
	} else {
		healthStatus["auth"] = ServiceStatus{
			Status:  "healthy",
			Message: "JWT authentication configured",
		}
	}

	// smtp health
	smtpUser := os.Getenv("SMTP_USERNAME")
	smtpPass := os.Getenv("SMTP_PASSWORD")
	if smtpUser == "" || smtpPass == "" {
		healthStatus["email"] = ServiceStatus{
			Status:  "warning",
			Message: "Email service not fully configured",
		}
	} else {
		healthStatus["email"] = ServiceStatus{
			Status:  "healthy",
			Message: "Email service configured",
		}
	}

	// URL shortener service
	if healthStatus["database"].Status == "healthy" &&
		(healthStatus["auth"].Status == "healthy" || healthStatus["auth"].Status == "warning") {
		healthStatus["shortner"] = ServiceStatus{
			Status:  "healthy",
			Message: "URL shortening service available",
		}
	} else {
		healthStatus["shortner"] = ServiceStatus{
			Status:  "unhealthy",
			Message: "URL shortening service unavailable due to dependency issues",
		}
	}

	// overall health
	overallStatus := "healthy"
	for _, status := range healthStatus {
		if status.Status == "unhealthy" {
			overallStatus = "unhealthy"
			break
		} else if status.Status == "warning" && overallStatus != "unhealthy" {
			overallStatus = "warning"
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"status":   overallStatus,
		"services": healthStatus,
	})
}

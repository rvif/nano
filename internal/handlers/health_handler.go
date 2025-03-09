package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/rvif/nano-url/db"
)

func HealthCheckHandler(c *gin.Context) {
	dbConn := db.GetDB()

	if dbConn == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"status": "Database connection not initialized yet"})
		return
	}

	if err := db.GetDB().Ping(); err != nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"status": "Database not reachable at the moment", "error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Database up and running, all systems good"})
}

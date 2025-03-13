package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/rvif/nano-url/db"
	"github.com/rvif/nano-url/internal/db/queries"
)

func GetMyAnalyticsHandler(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Not authenticated"})
		return
	}

	userUUID, ok := userID.(uuid.UUID)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid user-ID format"})
		return
	}

	DB := db.GetDB()
	q := queries.New(DB)

	analytics, err := q.GetAnalyticsByUserId(c, userUUID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not get analytics"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":                 analytics.ID,
		"user_id":            analytics.UserID,
		"total_urls":         analytics.TotalUrls,
		"total_total_clicks": analytics.TotalTotalClicks,
		"avg_daily_clicks":   analytics.AvgDailyClicks,
		"created_at":         analytics.CreatedAt,
		"updated_at":         analytics.UpdatedAt,
	})
}

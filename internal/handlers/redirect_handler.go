package handlers

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/rvif/nano-url/db"
	"github.com/rvif/nano-url/internal/db/queries"
)

func RedirectToURLHandler(c *gin.Context) {
	shortURL := c.Param("slug")
	fmt.Printf("Received request for slug: %s\n", shortURL)

	DB := db.GetDB()
	q := queries.New(DB)

	slugExists, err := q.SlugExists(c, shortURL)
	if err != nil {
		fmt.Printf("Error checking if slug %s exists: %v\n", shortURL, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}

	if !slugExists {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "URL not found",
			"slug":  shortURL,
		})
		return
	}

	originalURL, err := q.GetURLByShortURL(c, shortURL)
	if err != nil {
		fmt.Printf("Error getting URL for slug %s: %v\n", shortURL, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}

	fmt.Printf("Found URL for slug %s: %s\n", shortURL, originalURL)

	shouldIncrement := c.Query("increment") != "false"
	isActualRedirect := c.Query("type") == "redirect"

	if shouldIncrement && isActualRedirect {
		// Increment click count in a separate goroutine
		go func() {
			ctx := c.Copy()
			if err := q.IncrementURLClicks(ctx, shortURL); err != nil {
				fmt.Printf("Error incrementing clicks for %s: %v\n", shortURL, err)
			}
		}()

		/* Before redirecting, update user analytics */
		userID, err := q.GetUserIDByShortURL(c, shortURL)
		if err != nil {
			fmt.Printf("Error getting user ID for slug %s: %v\n", shortURL, err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
			return
		}

		_, err = q.UpdateAnalytics(c, queries.UpdateAnalyticsParams{
			TotalUrls:        0,
			TotalTotalClicks: 1,
			UserID:           userID,
		})

		if err != nil {
			fmt.Printf("Error updating analytics for user %s: %v\n", userID, err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
			return
		}

		/* End of user analytics update */
	}

	c.JSON(http.StatusOK, gin.H{
		"originalURL": originalURL,
	})
}

package handlers

import (
	"database/sql"
	"fmt"
	"math/rand"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/rvif/nano-url/db"
	"github.com/rvif/nano-url/internal/db/queries"
)

const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

func generateShortURL() string {
	const length = 5
	shortURL := make([]byte, length)

	for i := range shortURL {
		shortURL[i] = charset[rand.Intn(len(charset))]
	}

	return string(shortURL)
}

func createUniqueShortURL(db *sql.DB) (string, error) {
	for {
		shortURL := generateShortURL()

		// check if our generated short_url already exists in db
		var exists bool
		err := db.QueryRow("SELECT EXISTS (SELECT 1 FROM urls WHERE short_url = $1)", shortURL).Scan(&exists)
		if err != nil {
			return "", err
		}

		if !exists {
			return shortURL, nil
		}
	}
}

type CreateURLRequest struct {
	UserID   uuid.UUID `json:"user_id"`
	URL      string    `json:"url"`
	ShortURL string    `json:"short_url"`
}

func CreateURLHandler(c *gin.Context) {
	var req CreateURLRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	DB := db.GetDB()
	q := queries.New(DB)

	user, err := q.GetUserById(c, req.UserID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	userID := user.ID
	var shortURL string
	if req.ShortURL != "" {

		// check if user provided short_url already exists
		var exists bool
		err := DB.QueryRow("SELECT EXISTS (SELECT 1 FROM urls WHERE short_url = $1)", req.ShortURL).Scan(&exists)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not generate short URL"})
			return
		}
		if exists {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Short URL already exists"})
			return
		}
		shortURL = req.ShortURL
	} else {
		shortURL, err = createUniqueShortURL(DB)
		// if we get a duplicate short_url, keep trying until we get a unique one
		for err != nil {
			shortURL, err = createUniqueShortURL(DB)
		}
	}

	url, err := q.CreateURL(c, queries.CreateURLParams{
		UserID:   userID,
		Url:      req.URL,
		ShortUrl: shortURL,
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create URL"})
		return
	}

	/* Before redirecting, update user analytics */
	userID, err = q.GetUserIDByShortURL(c, shortURL)
	if err != nil {
		fmt.Printf("Error getting user ID for slug %s: %v\n", shortURL, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}

	_, err = q.UpdateAnalytics(c, queries.UpdateAnalyticsParams{
		TotalUrls:        1,
		TotalTotalClicks: 0,
		UserID:           userID,
	})

	if err != nil {
		fmt.Printf("Error updating analytics for user %s: %v\n", userID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}

	/* End of user analytics update */

	c.JSON(http.StatusOK, gin.H{
		"id":           url.ID,
		"user_id":      url.UserID,
		"url":          url.Url,
		"short_url":    url.ShortUrl,
		"total_clicks": url.TotalClicks,
		"daily_clicks": url.DailyClicks,
		"last_clicked": url.LastClicked,
		"created_at":   url.CreatedAt,
		"updated_at":   url.UpdatedAt,
	})
}

type GetURLSByUserIDRequest struct {
	UserID uuid.UUID `json:"user_id"`
}

func GetURLSByUserIDHandler(c *gin.Context) {
	var req GetURLSByUserIDRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	DB := db.GetDB()
	q := queries.New(DB)

	urls, err := q.GetURLsByUserID(c, req.UserID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not get URLs"})
		return
	}

	var response []gin.H
	for _, url := range urls {
		response = append(response, gin.H{
			"id":         url.ID,
			"url":        url.Url,
			"short_url":  url.ShortUrl,
			"created_at": url.CreatedAt,
			"updated_at": url.UpdatedAt,
		})
	}

	c.JSON(http.StatusOK, response)
}

type DeleteURLRequest struct {
	ShortURL string `json:"short_url"`
}

func DeleteURLHandler(c *gin.Context) {
	var req DeleteURLRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	DB := db.GetDB()
	q := queries.New(DB)

	err := q.DeleteURL(c, req.ShortURL)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not delete URL"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "URL deleted"})
}

type GetURLAnalyticsRequest struct {
	ShortURL string `json:"short_url"`
}

func GetURLAnalyticsHandler(c *gin.Context) {
	var req GetURLAnalyticsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	DB := db.GetDB()
	q := queries.New(DB)

	url, err := q.GetURLAnalytics(c, req.ShortURL)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not get URL analytics"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"total_clicks": url.TotalClicks,
		"daily_clicks": url.DailyClicks,
		"last_clicked": url.LastClicked,
	})
}

type UpdateShortURLRequest struct {
	UrlID       uuid.UUID `json:"url_id"`
	NewURL      string    `json:"new_url"`
	NewShortURL string    `json:"new_short_url"`
}

func UpdateShortURLHandler(c *gin.Context) {
	var req UpdateShortURLRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	DB := db.GetDB()
	q := queries.New(DB)

	existingURL, err := q.GetURLByID(c, req.UrlID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "URL not found"})
		return
	}

	// use existing values if new values are not provided
	newURL := req.NewURL
	if newURL == "" {
		newURL = existingURL.Url
	}

	newShortURL := req.NewShortURL
	if newShortURL == "" {
		newShortURL = existingURL.ShortUrl
	}

	url, err := q.UpdateShortURL(c, queries.UpdateShortURLParams{
		Column1: newURL,
		Column2: newShortURL,
		ID:      req.UrlID,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not update short URL"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":           url.ID,
		"user_id":      url.UserID,
		"url":          url.Url,
		"short_url":    url.ShortUrl,
		"total_clicks": url.TotalClicks,
		"daily_clicks": url.DailyClicks,
		"last_clicked": url.LastClicked,
		"created_at":   url.CreatedAt,
		"updated_at":   url.UpdatedAt,
	})
}

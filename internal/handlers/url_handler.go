package handlers

import (
	"database/sql"
	"math/rand"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/rvif/nano-url/db"
	"github.com/rvif/nano-url/internal/db/queries"
)

// all requests
/*
 	// URLs -> shortURLs
    url.POST("/shorten", handlers.CreateURLHandler)  ✅
    url.GET("/my-links", handlers.GetURLsByUserIDHandler)
    url.PATCH("/update/:short_url", handlers.UpdateShortURLHandler)
    url.GET("/analytics/:short_url", handlers.GetURLAnalyticsHandler)
    url.DELETE("/delete/:short_url", handlers.DeleteURLHandler)

*/

/*
-- name: CreateURL :one  ✅
INSERT INTO urls (id, user_id, url, short_url)
VALUES ($1, $2, $3, $4)
RETURNING id, user_id, url, short_url, total_clicks, daily_clicks, last_clicked, created_at, updated_at;

-- name: GetURLsByUserID :many
SELECT id, url, short_url, created_at, updated_at
FROM urls
WHERE user_id = $1;

-- name: UpdateShortURL :one
UPDATE urls
SET short_url = $1, updated_at = now()
WHERE id = $2
RETURNING id, user_id, url, short_url, total_clicks, daily_clicks, last_clicked, created_at, updated_at;

-- name: DeleteURL :exec
DELETE FROM urls WHERE short_url = $1;

-- name: GetURLAnalytics :one
SELECT total_clicks, daily_clicks, last_clicked
FROM urls
WHERE short_url = $1;

-- name: IncrementURLClicks :exec
UPDATE urls
SET total_clicks = total_clicks + 1,
    daily_clicks = daily_clicks + 1,
    last_clicked = now()
WHERE short_url = $1;

-- name: ResetDailyClicks :exec
UPDATE urls
SET daily_clicks = 0;


*/

const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

func generateShortURL() string {
	length := 4
	rand.Seed(time.Now().UnixNano())
	shortURL := make([]byte, length)

	for i := range shortURL {
		shortURL[i] = charset[rand.Intn(len(charset))]
	}

	return string(shortURL)
}

func createUniqueShortURL(db *sql.DB) (string, error) {
	for {
		shortURL := generateShortURL()

		// Check if our generated short URL already exists
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

		// Check if user provided short URL already exists
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
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not generate short URL"})
			return
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

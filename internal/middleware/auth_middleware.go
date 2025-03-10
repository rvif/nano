package middleware

import (
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"

	"github.com/google/uuid"
)

var jwtSecret = os.Getenv("JWT_SECRET")

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {

		tokenStr := c.GetHeader("Authorization")
		if tokenStr == "" {
			redirectTo := c.Request.URL.Path
			// TODO: integrate with frontend next?= query parameter
			next := c.DefaultQuery("next", "")
			if next != "" {
				redirectTo = next
			}
			c.Set("redirectTo", redirectTo)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized", "redirectTo": redirectTo})
			c.Abort()
			return
		}

		tokenStr = strings.TrimPrefix(tokenStr, "Bearer ")
		token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, jwt.ErrSignatureInvalid
			}
			return []byte(jwtSecret), nil
		})

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		// Extract the claims from the token
		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		// JWT stores claims as map[string]interface{} (i.e., it serializes UUID as a string), so we must parse it manually
		// Extract the user_id from the claims
		userIDStr, exists := claims["user_id"].(string)
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		// Parse the user_id string into a UUID
		userID, err := uuid.Parse(userIDStr)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		// Check if the token has expired
		if exp, ok := claims["expiry"].(float64); ok && time.Now().Unix() > int64(exp) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token expired"})
			c.Abort()
			return
		}

		c.Set("user_id", userID)
		c.Next()
	}

}

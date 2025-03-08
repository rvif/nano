package handlers

import (
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/rvif/nano-url/db"
	"github.com/rvif/nano-url/internal/db/queries"
	"github.com/rvif/nano-url/internal/mailer"

	"golang.org/x/crypto/bcrypt"
)

var jwtSecret = os.Getenv("JWT_SECRET")

var mailClient *mailer.Mailer

func InitMailer(username, password string) {
	mailClient = mailer.NewMailer(username, password)
}

type RegisterRequest struct {
	ID       uuid.UUID `json:"id"`
	Username string    `json:"username" binding:"required,max=16"`
	Email    string    `json:"email" binding:"required,email"`
	Password string    `json:"password" binding:"required,min=6"`
}

func RegisterHandler(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failure in hashing password"})
		return
	}

	DB := db.GetDB()
	q := queries.New(DB)

	userID := uuid.New()
	user, err := q.CreateUser(c, queries.CreateUserParams{
		ID:             userID,
		Username:       req.Username,
		Email:          req.Email,
		HashedPassword: string(hashedPassword),
	})

	fmt.Printf("err: %v\n", err)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failure in creating user"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"user": user})
}

type LoginRequest struct {
	Email    string `json:"email"      binding:"required,email"`
	Password string `json:"password"   binding:"required"`
}

func LoginHandler(c *gin.Context) {
	var req LoginRequest
	redirectTo, exists := c.Get("redirectTo")
	if !exists {
		redirectTo = "/home"
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	DB := db.GetDB()
	q := queries.New(DB)

	user, err := q.GetUserByEmail(c, req.Email)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.HashedPassword), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": user.ID.String(),
		"expiry":  time.Now().Add(time.Hour * 72).Unix(),
	})

	// Sign the token with the secret
	accessTokenStr, err := accessToken.SignedString([]byte(jwtSecret))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failure in creating token"})
		return
	}

	refreshToken := uuid.New().String()
	expiry := time.Now().Add(time.Hour * 24 * 7) // 7 days
	err = q.StoreResetToken(c, queries.StoreResetTokenParams{
		UserID: user.ID,
		Token:  refreshToken,
		Expiry: expiry,
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failure in storing refresh token"})
		return
	}

	// Check whether the request is an API request or a browser request
	acceptHeader := c.Request.Header.Get("Accept")
	wantsJSON := strings.Contains(acceptHeader, "application/json")

	if wantsJSON {
		c.JSON(http.StatusOK, gin.H{"access_token": accessTokenStr, "refresh_token": refreshToken})
	} else {
		c.Redirect(http.StatusFound, fmt.Sprintf("%s?access_token=%s&refresh_token=%s", redirectTo, accessTokenStr, refreshToken))
		// const token = urlParams.get('access_token')
		// localStorage.setItem('authToken', access_token)
	}
}

func MeHandler(c *gin.Context) {
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

	user, err := q.GetUserById(c, userUUID)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Could not find user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":       user.ID,
		"username": user.Username,
		"email":    user.Email,
	})
}

type ForgotPasswordRequest struct {
	Email string `json:"email" binding:"required,email"`
}

func ForgotPasswordHandler(c *gin.Context) {
	var req ForgotPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	DB := db.GetDB()
	q := queries.New(DB)

	user, err := q.GetUserByEmail(c, req.Email)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	userID := user.ID
	resetToken := uuid.New().String()
	expiry := time.Now().Add(time.Minute * 10)

	err = q.StoreResetToken(c, queries.StoreResetTokenParams{
		UserID: userID,
		Token:  resetToken,
		Expiry: expiry,
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failure in storing reset token"})
		return
	}

	resetURL := fmt.Sprintf("http://localhost:8080/reset-password?token=%s", resetToken) // TODO: Change this to your frontend URL
	emailBody := fmt.Sprintf("Click here to reset your password: %s", resetURL)

	err = mailClient.SendEmail(req.Email, "Password Reset", emailBody)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failure in sending email"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Password reset email sent"})
}

type ResetPasswordRequest struct {
	Token    string `json:"token" binding:"required"`
	Password string `json:"password" binding:"required,min=6"`
}

func ResetPasswordHandler(c *gin.Context) {
	var req ResetPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	DB := db.GetDB()
	q := queries.New(DB)

	resetTokenDetails, err := q.GetUserByResetToken(c, req.Token)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Invalid or expired reset token"})
		return
	}

	if resetTokenDetails.Expiry.Before(time.Now()) {
		c.JSON(http.StatusNotFound, gin.H{"error": "Invalid or expired reset token"})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failure in hashing password"})
		return
	}

	err = q.UpdateUserPassword(c, queries.UpdateUserPasswordParams{
		HashedPassword: string(hashedPassword),
		ID:             resetTokenDetails.UserID,
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failure in updating password"})
		return
	}

	err = q.DeleteResetToken(c, req.Token)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failure in deleting reset token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Password updated successfully"})
}

// Ts refreshes the access token
// so if a person has ticked remember me option, we can hit this refresh token endpoint periodically or whenever the access token expires
// we will send the refresh token in the header
// and we will return a new access token
func RefreshTokenHandler(c *gin.Context) {
	refreshToken := c.GetHeader("Authorization")
	if refreshToken == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Missing refresh token"})
		return
	}

	DB := db.GetDB()
	q := queries.New(DB)

	resetTokenDetails, err := q.GetUserByResetToken(c, refreshToken)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Invalid or expired refresh token"})
		return
	}

	if time.Now().After(resetTokenDetails.Expiry) {
		c.JSON(http.StatusNotFound, gin.H{"error": "Invalid or expired refresh token"})
		return
	}

	newAccessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": resetTokenDetails.UserID.String(),
		"expiry":  time.Now().Add(time.Hour * 72).Unix(),
	})

	// Sign the token with the secret
	newAccessTokenStr, err := newAccessToken.SignedString([]byte(jwtSecret))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failure in creating token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"access_token": newAccessTokenStr})
}

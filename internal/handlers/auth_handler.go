package handlers

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
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
	ID       uuid.UUID `form:"id" json:"id"`
	Username string    `form:"username" json:"username" binding:"required,max=16"`
	Email    string    `form:"email" json:"email" binding:"required,email"`
	Password string    `form:"password" json:"password" binding:"required,min=6"`
	PfpUrl   string    `form:"profile_picture" json:"profile_picture"`
}

func RegisterHandler(c *gin.Context) {
	// for multipart form data, use c.ShouldBind instead of c.ShouldBindJSON
	var req RegisterRequest
	if err := c.ShouldBind(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	file, fileHeader, err := c.Request.FormFile("pfp")
	var pfpURL string

	// default profile picture path
	defaultPfpPath := "/images/default_pfp.jpg"

	// check if public/images/default_pfp.jpg exists
	if _, err := os.Stat("./public/images/default_pfp.jpg"); os.IsNotExist(err) {
		log.Printf("WARNING: Default profile picture not found at ./public/images/default_pfp.jpg")
	} else {
		log.Printf("Default profile picture exists at ./public/images/default_pfp.jpg")
	}

	if err == nil && file != nil {
		// ensure public/images directory exists
		uploadDir := "./public/images"
		if err := os.MkdirAll(uploadDir, 0755); err != nil {
			fmt.Printf("Error creating directory %s: %v\n", uploadDir, err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create upload directory"})
			return
		}

		// generate unique filename
		filename := strings.ReplaceAll(uuid.New().String(), "-", "") + filepath.Ext(fileHeader.Filename)
		uploadPath := filepath.Join(uploadDir, filename)

		// save the file with proper error handling
		if err := c.SaveUploadedFile(fileHeader, uploadPath); err != nil {
			fmt.Printf("Error saving file to %s: %v\n", uploadPath, err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save profile picture"})
			return
		}

		pfpURL = "/images/" + filename
		fmt.Printf("Successfully saved profile picture to %s\n", uploadPath)
	} else {
		pfpURL = defaultPfpPath
		fmt.Printf("No profile picture uploaded, using default: %s\n", defaultPfpPath)
	}

	// Check if user with this email already exists
	DB := db.GetDB()
	q := queries.New(DB)

	existingUser, err := q.GetUserByEmail(c, req.Email)
	if err == nil && existingUser.ID != uuid.Nil {
		c.JSON(http.StatusConflict, gin.H{"error": "A user with this email already exists"})
		return
	}

	// Continue with normal registration flow
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failure in hashing password"})
		return
	}

	userID := uuid.New()

	user, err := q.CreateUser(c, queries.CreateUserParams{
		ID:             userID,
		Username:       req.Username,
		Email:          req.Email,
		HashedPassword: string(hashedPassword),
		PfpUrl:         pfpURL,
	})

	if err != nil {
		fmt.Printf("Error creating user: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failure in creating user"})
		return
	}

	/*
		Create analytics record for user if it doesn't exist
	*/
	_, err = q.CreateAnalytics(c, queries.CreateAnalyticsParams{
		ID:     uuid.New(),
		UserID: userID,
	})

	if err != nil {
		fmt.Println("Error creating analytics record: ", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failure in creating analytics record"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "User registered successfully", "user": user})
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

	// sign the token with the secret
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
		"pfpUrl":   user.PfpUrl,
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

	// update the URL to use the frontend URL from environment
	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL == "" {
		frontendURL = "https://rvif.me" // hardcoded for now
	}

	resetURL := fmt.Sprintf("%s/auth/reset-password?token=%s", frontendURL, resetToken)
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
// so if a person has checked the remember me option, we store refresh token in the localstorage
// we can hit this refresh token endpoint periodically or whenever the access token expires
// we'll send a new access, refresh token in the header again
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

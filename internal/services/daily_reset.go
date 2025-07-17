package services

import (
	"context"
	"log"
	"time"

	"github.com/rvif/nano-url/db"
	"github.com/rvif/nano-url/internal/db/queries"
)

type DailyResetService struct {
	location  *time.Location
	stop      chan bool
	isRunning bool
}

func NewDailyResetService(location *time.Location) *DailyResetService {
	log.Println("Creating daily reset service for timezone:", location)
	return &DailyResetService{
		location:  location,
		stop:      make(chan bool),
		isRunning: false,
	}
}

func (s *DailyResetService) Start() {
	if s.isRunning {
		log.Println("Daily reset service is already running")
		return
	}

	log.Println("Starting daily reset service...")

	now := time.Now().In(s.location)
	nextMidnight := time.Date(now.Year(), now.Month(), now.Day()+1, 0, 0, 0, 0, s.location)
	sleepDuration := nextMidnight.Sub(now)

	log.Printf("Daily reset service started successfully!")
	log.Printf("Next reset scheduled for %s", nextMidnight.Format("2006-01-02 15:04:05 MST"))
	log.Printf("Time until next reset: %v", sleepDuration.Round(time.Second))

	s.isRunning = true

	go func() {
		for {
			now := time.Now().In(s.location)
			nextMidnight := time.Date(now.Year(), now.Month(), now.Day()+1, 0, 0, 0, 0, s.location)
			sleepDuration := nextMidnight.Sub(now)

			if sleepDuration < time.Second {
				sleepDuration = 24 * time.Hour
			}

			log.Printf("Waiting for next reset cycle: %v until %v",
				sleepDuration.Round(time.Second),
				nextMidnight.Format("2006-01-02 15:04:05 MST"))

			select {
			case <-time.After(sleepDuration):
				log.Println("Scheduled time reached, executing daily reset...")
				s.resetDailyClicks()
			case <-s.stop:
				log.Println("Daily reset service stopped")
				s.isRunning = false
				return
			}
		}
	}()
}

func (s *DailyResetService) Stop() {
	if !s.isRunning {
		log.Println("Daily reset service is not running")
		return
	}

	log.Println("Stopping daily reset service...")
	s.stop <- true
}

func (s *DailyResetService) resetDailyClicks() {
	log.Println("🔄 Resetting daily click counters...")

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	DB := db.GetDB()
	q := queries.New(DB)

	maxRetries := 3
	for attempt := 1; attempt <= maxRetries; attempt++ {
		err := q.ResetDailyClicks(ctx)
		if err != nil {
			log.Printf("Error resetting daily clicks (attempt %d/%d): %v",
				attempt, maxRetries, err)

			if attempt < maxRetries {
				time.Sleep(5 * time.Second)
				continue
			}
		} else {
			log.Printf("Successfully reset daily click counters at %v",
				time.Now().In(s.location).Format("2006-01-02 15:04:05 MST"))
			return
		}
	}

	log.Printf("Failed to reset daily clicks after %d attempts", maxRetries)
}

func (s *DailyResetService) IsRunning() bool {
	return s.isRunning
}

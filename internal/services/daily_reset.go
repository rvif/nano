package services

import (
	"context"
	"log"
	"time"

	"github.com/rvif/nano-url/db"
	"github.com/rvif/nano-url/internal/db/queries"
)

type DailyResetService struct {
	location *time.Location
	stop     chan bool
}

func NewDailyResetService(location *time.Location) *DailyResetService {
	log.Println("Creating daily reset service for timezone:", location)
	return &DailyResetService{
		location: location,
		stop:     make(chan bool),
	}
}

func (s *DailyResetService) Start() {
	log.Println("Starting daily reset service...")

	now := time.Now().In(s.location)
	nextMidnight := time.Date(now.Year(), now.Month(), now.Day()+1, 0, 0, 0, 0, s.location)
	sleepDuration := nextMidnight.Sub(now)

	log.Printf("Daily reset service started successfully!")
	log.Printf("Next reset scheduled for %s", nextMidnight.Format("2006-01-02 15:04:05 MST"))
	log.Printf("Time until next reset: %v", sleepDuration.Round(time.Second))

	go func() {
		for {
			now := time.Now().In(s.location)
			// calculating duration until next midnight (00:00:00)
			nextMidnight := time.Date(now.Year(), now.Month(), now.Day()+1, 0, 0, 0, 0, s.location)
			sleepDuration := nextMidnight.Sub(now)

			log.Printf("Waiting for next reset cycle: %v until %v",
				sleepDuration.Round(time.Second),
				nextMidnight.Format("2006-01-02 15:04:05 MST"))

			select {
			case <-time.After(sleepDuration):
				s.resetDailyClicks()
			case <-s.stop:
				log.Println("Daily reset service stopped")
				return
			}
		}
	}()
}

func (s *DailyResetService) Stop() {
	log.Println("Stopping daily reset service...")
	s.stop <- true
}

func (s *DailyResetService) resetDailyClicks() {
	log.Println("🔄 Resetting daily click counters...")

	DB := db.GetDB()
	q := queries.New(DB)

	err := q.ResetDailyClicks(context.Background())
	if err != nil {
		log.Printf("Error resetting daily clicks: %v", err)
	} else {
		log.Printf("Successfully reset daily click counters at %v",
			time.Now().In(s.location).Format("2006-01-02 15:04:05 MST"))
	}
}

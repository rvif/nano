package mailer

import (
	"log"

	"gopkg.in/gomail.v2"
)

type Mailer struct {
	SMTPHost string
	SMTPPort int
	Username string
	Password string
	From     string
}

func NewMailer(username, password string) *Mailer {
	return &Mailer{
		SMTPHost: "smtp.gmail.com",
		SMTPPort: 587,
		Username: username,
		Password: password,
		From:     username, // email address of the sender
	}
}

func (m *Mailer) SendEmail(to, subject, body string) error {
	msg := gomail.NewMessage()
	msg.SetHeader("From", m.From)
	msg.SetHeader("To", to)
	msg.SetHeader("Subject", subject)
	msg.SetBody("text/html", body)

	dialer := gomail.NewDialer(m.SMTPHost, m.SMTPPort, m.Username, m.Password)
	if err := dialer.DialAndSend(msg); err != nil {
		log.Println("SMTP FAILED:", err)
		return err
	}

	log.Printf("Email sent successfully to %s", to)
	return nil
}

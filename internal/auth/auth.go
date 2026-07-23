package auth

import "time"

type OAuth struct {
	ClientUsername     string
	ClientPassword     string
	ClientID           string
	AccessToken        string
	RefreshAccessToken time.Time
}

// NewOAuth creates a new OAuth connection
func NewOAuth() *OAuth {
	return &OAuth{}
}

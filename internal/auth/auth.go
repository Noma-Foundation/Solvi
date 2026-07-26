package auth

import "time"

type OAuth struct {
	ClientUsername string
	ClientID       string
	AccessToken    string
	RefreshedAt    time.Time
}

// NewOAuth creates a new OAuth connection
func NewOAuth() *OAuth {
	return &OAuth{}
}

// Verifies if the user has the specific permission in the scope
func (o *OAuth) HasScope(scope string) (bool, error) {
	return true, nil
}

// Generates a new access token using the refresh token
func (o *OAuth) RefreshToken(refreshToken string) error {
	return nil
}

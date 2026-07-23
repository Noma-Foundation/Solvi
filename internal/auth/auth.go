package auth

import "time"

type OAuth struct {
	ClientUsername     string
	ClientPassword     string
	ClientID           string
	AccessToken        string
	RefreshAccessToken time.Time
}

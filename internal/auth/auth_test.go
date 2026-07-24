package auth_test

import (
	"orderhub/internal/auth"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestCreateNewAuth(t *testing.T) {
	assert := assert.New(t)

	oauth := auth.NewOAuth()

	assert.Equal("", oauth.AccessToken, "AccessToken should be initialized as an empty string")
	assert.Equal("", oauth.ClientUsername, "ClientUsername should be initialized as an empty string")
	assert.Equal("", oauth.ClientID, "ClientID should be initialized as an empty string")
	assert.True(oauth.RefreshedAt.IsZero(), "RefreshedAt should be initialized as zero time")
}

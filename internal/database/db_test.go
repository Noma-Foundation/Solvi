package database_test

import (
	"context"
	"orderhub/internal/database"
	"testing"

	"github.com/stretchr/testify/assert"
)

var (
	databaseName = "orderhub-test"
	ctx          = context.TODO()
)

func TestInstantiateDatabaseConnectionObject(t *testing.T) {
	assert := assert.New(t)
	dbConn, _, _ := database.NewDatabaseConnection(ctx, databaseName)

	assert.Equal(true, dbConn.IsConnected)
}

func TestInstantiateDatabaseWithInvalidName(t *testing.T) {
	assert := assert.New(t)
	dbConn, _, err := database.NewDatabaseConnection(ctx, "")

	assert.Equal(false, dbConn.IsConnected)
	assert.Equal("", dbConn.DatabaseName)
	assert.NotEqual(nil, err)
}

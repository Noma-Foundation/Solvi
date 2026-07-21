package database_test

import (
	"context"
	"errors"
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

func TestInstantiateDatabaseWithInvalidDB(t *testing.T) {
	dbConn, _, _ := database.NewDatabaseConnection(ctx, "")

	if dbConn.DatabaseName != "" {
		t.Fatal(errors.New("Database name should be empty"))
	}

}

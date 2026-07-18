package database_test

import (
	"errors"
	"orderhub/internal/database"
	"testing"
)

func TestInstantiateDatabaseConnectionObject(t *testing.T) {
	dbConn, _, err := database.NewDatabaseConnection(nil, "orderhub-test")

	if err != nil {
		errors.New("Error to instantiate database connection")
	}

	if dbConn.IsConnected != true {
		errors.New("Database connection is not established")
	}

	if dbConn.DatabaseName != "orderhub-test" {
		errors.New("Database name is incorrect")
	}

}

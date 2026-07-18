package database_test

import (
	"context"
	"errors"
	"orderhub/internal/database"
	"testing"
)

func TestInstantiateDatabaseConnectionObject(t *testing.T) {
	dbConn, _, err := database.NewDatabaseConnection(context.TODO(), "orderhub-test")

	if err != nil {
		t.Fatal(errors.New("Error to instantiate database connection"))
	}

	if dbConn.IsConnected != true {
		t.Fatal(errors.New("Database connection is not established"))
	}

	if dbConn.DatabaseName != "orderhub-test" {
		t.Fatal(errors.New("Database name is incorrect"))
	}

}

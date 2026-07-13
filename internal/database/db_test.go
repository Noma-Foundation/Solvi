package database_test

import (
	"orderhub/internal/database"
	"testing"
)

func TestCreateDatabaseConnectionStruct(t *testing.T) {
	conn, err := database.NewDatabaseConnection("orderhub")

	if err != nil {
		t.Error("The program is crashed. The database connection is not establised.")
	}

	if conn.DatabaseName != "orderhub" {
		t.Error("The database name is not correct.")
	}
}

package database

import (
	"fmt"
)

func PrintDatabaseInfo(db *DatabaseConnection) {
	conn := db
	fmt.Println("DEBUG | Database:", conn.DatabaseName, conn.ConnectedAt, conn.IsConnected)
}

func CreateDatabase(databaseName string) (string, error) {
	var exists bool
	var dbName string = databaseName
	query := "SELECT EXISTS(SELECT 1 FROM pg_database WHERE datname = $1)"
	err := DB.QueryRow(query, databaseName).Scan(&exists)

	if err != nil {
		dbName = "postgres"
		return dbName, err
	}

	if !exists {
		_, err := DB.Exec(fmt.Sprintf("CREATE DATABASE %s", databaseName))

		if err != nil {
			dbName = "postgres"
			return dbName, err
		}
	}
	return dbName, nil
}

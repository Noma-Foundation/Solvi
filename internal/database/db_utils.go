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

func ValidadeEmployeeExists(username string) bool {
	exists := false
	query := "SELECT EXISTS(SELECT 1 FROM employees WHERE username = $1)"
	err := DB.QueryRow(query, username).Scan(&exists)

	if err != nil {
		return false
	}
	return exists
}

func CreateEmployeeTable() {
	exists := false
	query := `
	CREATE TABLE IF NOT EXISTS employees (
		id SERIAL PRIMARY KEY,
		name VARCHAR(255) NOT NULL,
		username VARCHAR(255) NOT NULL,
		password VARCHAR(255) NOT NULL,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	)`

	DB.QueryRow(query).Scan(&exists)
	if !exists {
		DB.Exec(query)
	}
}

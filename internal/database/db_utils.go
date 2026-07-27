package database

import (
	"errors"
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

// ValidateEmployeeExists validates if an employee exists in the database
func ValidadeEmployeeExists(username string) bool {
	exists := false
	query := "SELECT EXISTS(SELECT 1 FROM employees WHERE username = $1)"
	err := DB.QueryRow(query, username).Scan(&exists)

	if err != nil {
		return false
	}
	return exists
}

// GetPasswordHashByUsername retrieves the password hash for a given username
func GetPasswordHashByUsername(username string) (string, error) {
	var hash string

	query := "SELECT password FROM employees WHERE username = $1"
	err := DB.QueryRow(query, username).Scan(&hash)

	if err != nil {
		return "", err
	}

	return hash, nil
}

func CreateEmployeeTable() error {
	query := `
	CREATE TABLE IF NOT EXISTS employees (
		id SERIAL PRIMARY KEY,
		name VARCHAR(255) NOT NULL,
		username VARCHAR(255) NOT NULL,
		password VARCHAR(255) NOT NULL,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	)`

	_, err := DB.Exec(query)
	if err != nil {
		return errors.New("Error trying to create employee table: " + err.Error())
	}
	return nil
}

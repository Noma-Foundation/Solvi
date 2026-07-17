package database

import (
	"database/sql"
	"fmt"
	"time"
)

const User = "postgres"

const Host = "localhost"

const Port = "5432"

type DatabaseConnection struct {
	DatabaseName string
	ConnectedAt  time.Time
	IsConnected  bool
}

func NewDatabaseConnection(databaseName string) (*DatabaseConnection, *sql.DB, error) {
	psqlInfo := fmt.Sprintf("host=%s port=%s user=%s dbname=%s sslmode=disable", Host, Port, User, databaseName)

	db, _ := sql.Open(User, psqlInfo)

	return &DatabaseConnection{
		DatabaseName: databaseName,
		ConnectedAt:  time.Now().UTC(),
		IsConnected:  false,
	}, db, nil
}

func (db *DatabaseConnection) Connect() error {
	return nil
}

func (db *DatabaseConnection) Disconnect() error {
	return nil
}

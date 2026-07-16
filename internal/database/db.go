package database

import "time"

type DatabaseConnection struct {
	DatabaseName string
	ConnectedAt  time.Time
	IsConnected  bool
}

func NewDatabaseConnection(databaseName string) (*DatabaseConnection, error) {
	return &DatabaseConnection{
		DatabaseName: databaseName,
		ConnectedAt:  time.Now().UTC(),
		IsConnected:  false,
	}, nil
}

func (db *DatabaseConnection) Connect() error {
	return nil
}

func (db *DatabaseConnection) Disconnect() error {
	return nil
}

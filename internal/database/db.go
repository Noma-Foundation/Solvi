package database

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	_ "github.com/lib/pq"
)

const User = "postgres"

const Host = "localhost"

const Port = "5432"

type DatabaseConnection struct {
	DatabaseName string
	ConnectedAt  time.Time
	IsConnected  bool
	ctx          context.Context
}

func NewDatabaseConnection(ctx context.Context, databaseName string) (*DatabaseConnection, *sql.DB, error) {
	psqlInfo := fmt.Sprintf("host=%s port=%s user=%s dbname=%s sslmode=disable",
		Host, Port, User, databaseName)
	databaseConnection, err := sql.Open(User, psqlInfo)

	if err != nil {
		return nil, nil, err
	}

	databaseReturn := DatabaseConnection{
		DatabaseName: databaseName,
		ConnectedAt:  time.Now(),
		IsConnected:  true,
		ctx:          ctx,
	}
	return &databaseReturn, databaseConnection, nil
}

func (db *DatabaseConnection) Connect() error {
	return nil
}

func (db *DatabaseConnection) Disconnect() error {
	return nil
}

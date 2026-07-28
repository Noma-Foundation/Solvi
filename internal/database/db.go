package database

import (
	"context"
	"database/sql"
	"errors"
	"os"
	"time"

	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

var (
	DB                *sql.DB
	databaseReturnErr = &DatabaseConnection{
		DatabaseName: "",
		ConnectedAt:  time.Time{},
		IsConnected:  false,
		ctx:          context.Background(),
	}
)

type DatabaseConnection struct {
	DatabaseName string
	ConnectedAt  time.Time
	IsConnected  bool
	ctx          context.Context
}

func NewDatabaseConnection(ctx context.Context, databaseName string) (*DatabaseConnection, error) {
	_ = godotenv.Load()
	psqlInfo := os.Getenv("DATABASE_DEVELOPMENT_URL")

	databaseConnection, err := sql.Open("postgres", psqlInfo)

	if err != nil {
		return databaseReturnErr, err
	}

	if databaseName == "" || databaseConnection == nil {
		return databaseReturnErr, errors.New("Invalid database name or port connection")
	}

	_, err = databaseConnection.Exec(`
		CREATE TABLE IF NOT EXISTS budgets (
			id SERIAL PRIMARY KEY,
			client_name VARCHAR(255),
			budget VARCHAR(255),
			address VARCHAR(255),
			description TEXT
		);
	`)

	if err != nil {
		return databaseReturnErr, err
	}

	DB = databaseConnection

	return &DatabaseConnection{
		DatabaseName: databaseName,
		ConnectedAt:  time.Now(),
		IsConnected:  true,
		ctx:          ctx,
	}, nil
}

package database

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	_ "github.com/lib/pq"
)

var (
	databaseReturnErr = &DatabaseConnection{
		DatabaseName: "",
		ConnectedAt:  time.Time{},
		IsConnected:  false,
		ctx:          context.Background(),
	}
)

const (
	User     = "postgres"
	Host     = "localhost"
	Port     = "5432"
	Password = "admin"
)

type DatabaseConnection struct {
	DatabaseName string
	ConnectedAt  time.Time
	IsConnected  bool
	ctx          context.Context
}

func NewDatabaseConnection(ctx context.Context, databaseName string) (*DatabaseConnection, *sql.DB, error) {
	psqlInfo := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		Host, Port, User, Password, databaseName)
	databaseConnection, err := sql.Open("postgres", psqlInfo)

	if err != nil {
		return databaseReturnErr, nil, err
	}

	if databaseName == "" || databaseConnection == nil {
		return databaseReturnErr, nil, errors.New("Invalid database name or port connection")
	}

	databaseReturn := DatabaseConnection{
		DatabaseName: databaseName,
		ConnectedAt:  time.Now(),
		IsConnected:  true,
		ctx:          ctx,
	}

	return &databaseReturn, databaseConnection, nil
}

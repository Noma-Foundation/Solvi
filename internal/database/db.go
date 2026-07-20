package database

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	_ "github.com/lib/pq"
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

	if err != nil || databaseConnection == nil {
		databaseReturnErr := &DatabaseConnection{
			DatabaseName: "",
			ConnectedAt:  time.Time{},
			IsConnected:  false,
			ctx:          ctx,
		}

		return databaseReturnErr, nil, err
	}

	databaseReturn := DatabaseConnection{
		DatabaseName: databaseName,
		ConnectedAt:  time.Now(),
		IsConnected:  true,
		ctx:          ctx,
	}

	return &databaseReturn, databaseConnection, nil
}

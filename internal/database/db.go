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

var (
	User     = "postgres"
	Host     = "localhost"
	Port     = "5432"
	Password = "admin" // Change password later
)

type DatabaseConnection struct {
	DatabaseName string
	ConnectedAt  time.Time
	IsConnected  bool
	ctx          context.Context
}

func NewDatabaseConnection(ctx context.Context, databaseName string) (*DatabaseConnection, *sql.DB, error) {
	// Carrega as variáveis de ambiente do arquivo .env
	_ = godotenv.Load()
	psqlInfo := os.Getenv("DATABASE_URL")

	databaseConnection, err := sql.Open("postgres", psqlInfo)

	if err != nil {
		return databaseReturnErr, nil, err
	}

	if databaseName == "" || databaseConnection == nil {
		return databaseReturnErr, nil, errors.New("Invalid database name or port connection")
	}

	// Garante que a tabela exista para evitar erros em consultas e facilita o desenvolvimento
	_, _ = databaseConnection.Exec(`
		CREATE TABLE IF NOT EXISTS budgets (
			id SERIAL PRIMARY KEY,
			client_name VARCHAR(255),
			budget VARCHAR(255),
			address VARCHAR(255),
			description TEXT
		);
	`)

	// Armazena no pacote globalmente para acesso seguro e fácil
	DB = databaseConnection

	databaseReturn := DatabaseConnection{
		DatabaseName: databaseName,
		ConnectedAt:  time.Now(),
		IsConnected:  true,
		ctx:          ctx,
	}
	return &databaseReturn, databaseConnection, nil
}

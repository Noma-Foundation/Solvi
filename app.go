package main

import (
	"context"
	"database/sql"
	"errors"
	"orderhub/internal"
	"orderhub/internal/database"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

var db *sql.DB
var serverSetting *internal.ServerSetting
var config *internal.Config

// App struct
type App struct {
	ctx context.Context
	hub *internal.OrderHub
}

// NewApp creates a new App application struct
func NewApp(hub *internal.OrderHub) *App {
	return &App{hub: hub}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	// Initialize application and database
	a.ctx = ctx
	a.hub.Init(ctx)
	a.setSettingsSystem()

	config = internal.NewConfig()
	serverSetting = internal.NewServerSetting()

	if connInfo, err := a.initializeDatabase(ctx); err != nil {
		runtime.LogError(ctx, err.Error())
		return
	} else {
		config.SetDatabaseConnection(connInfo)
		a.hub.DB = db
	}

	config.SetOrderHub(a.hub)
	config.SetServerSetting(serverSetting)

	runtime.LogInfo(ctx, "OrderHub environment started successfully")
}

// shutdown is called when the app is closing.
func (a *App) shutdown(ctx context.Context) {
	if err := a.closeDatabase(db); err != nil {
		runtime.LogError(ctx, err.Error())
		return
	}
	runtime.LogInfo(ctx, "OrderHub environment shutting down")
}

func (a *App) initializeDatabase(ctx context.Context) (*database.DatabaseConnection, error) {
	var message string
	conn, err := database.NewDatabaseConnection(ctx, "postgres")
	db = database.DB

	if err != nil {
		message = "Error trying to instantiate database connection: " + err.Error()
		runtime.LogError(a.ctx, message)
		return nil, errors.New(message)
	}

	if err := db.Ping(); err != nil {
		message = "Error trying to connect to database: " + err.Error()
		runtime.LogError(a.ctx, message)
		return nil, errors.New(message)
	}

	if _, err := database.CreateDatabase("orderhub"); err != nil {
		message = "Error trying to create database: " + err.Error()
		runtime.LogError(a.ctx, message)
		return nil, errors.New(message)
	}

	message = "Database connected at: " + conn.ConnectedAt.Format("2006-01-02 15:04:05")
	runtime.LogInfo(a.ctx, message)
	database.PrintDatabaseInfo(conn)
	database.CreateEmployeeTable()

	return conn, nil
}

func (a *App) closeDatabase(db *sql.DB) error {
	if err := db.Close(); err != nil {
		runtime.LogError(a.ctx, "Error trying to disconnect from database: "+err.Error())
		return err
	}
	runtime.LogInfo(a.ctx, "OrderHub disconnected from database")
	return nil
}

func (a *App) setSettingsSystem() error {
	return nil
}

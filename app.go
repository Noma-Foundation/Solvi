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

	if _, err := a.initializeDatabase(ctx); err != nil {
		runtime.LogError(ctx, err.Error())
		return
	}
	runtime.LogInfo(ctx, "OrderHub environment started successfully")
}

// shutdown is called when the app is closing.
func (a *App) shutdown(ctx context.Context) {
	if err := a.closeDatabase(db); err != nil {
		runtime.LogError(ctx, err.Error())
	}
	runtime.LogInfo(ctx, "OrderHub environment shutting down")
}

func (a *App) initializeDatabase(ctx context.Context) (*database.DatabaseConnection, error) {
	var message string
	connInfo, d, err := database.NewDatabaseConnection(ctx, "orderhub-test")
	db = d

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

	runtime.LogInfo(a.ctx, "Database connected: "+connInfo.DatabaseName)
	return connInfo, nil
}

func (a *App) closeDatabase(db *sql.DB) error {
	if err := db.Close(); err != nil {
		runtime.LogError(a.ctx, "Error trying to disconnect from database: "+err.Error())
		return err
	}
	runtime.LogInfo(a.ctx, "OrderHub disconnected from database")
	return nil
}

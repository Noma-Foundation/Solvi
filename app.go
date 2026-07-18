package main

import (
	"context"
	"database/sql"
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
	a.startDatabase()
	runtime.LogInfo(ctx, "OrderHub environment started successfully")
}

// shutdown is called when the app is closing.
func (a *App) shutdown(ctx context.Context) {
	a.finishDatabase(db)
	runtime.LogInfo(ctx, "OrderHub environment shutting down")
}

func (a *App) startDatabase() (*database.DatabaseConnection, error) {
	connInfo, d, err := database.NewDatabaseConnection(a.ctx, "orderhub-test")
	db = d

	if err != nil {
		runtime.LogError(a.ctx, "Error trying to instantiate database connection")
		return nil, nil
	}

	if err := connInfo.Connect(); err != nil {
		runtime.LogError(a.ctx, "Error trying to connect to database")
		return nil, nil
	}

	runtime.LogInfo(a.ctx, "Database connected: "+connInfo.DatabaseName)
	return connInfo, nil
}

func (a *App) finishDatabase(db *sql.DB) error {
	db.Close()
	runtime.LogInfo(a.ctx, "OrderHub disconnected from database")
	return nil
}

package main

import (
	"context"
	"orderhub/internal"
	"orderhub/internal/database"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

var db database.DatabaseConnection

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
	a.finishDatabase(&db)
	runtime.LogInfo(ctx, "OrderHub environment shutting down")
}

func (a *App) startDatabase() (*database.DatabaseConnection, error) {
	var logMessage string
	conn, err := database.NewDatabaseConnection("orderhub")

	if err != nil {
		runtime.LogError(a.ctx, "Error trying to instantiate database connection")
		return nil, nil
	}

	if err := conn.Connect(); err != nil {
		runtime.LogError(a.ctx, "Error trying to connect to database")
		return nil, nil
	}

	logMessage = "Database connected at: " + conn.ConnectedAt.Format("2006-01-02 15:04:05")
	runtime.LogInfo(a.ctx, logMessage)

	return conn, nil
}

func (a *App) finishDatabase(conn *database.DatabaseConnection) error {
	runtime.LogDebug(a.ctx, conn.ConnectedAt.String())
	return nil
}

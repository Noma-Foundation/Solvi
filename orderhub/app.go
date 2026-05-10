package main

import (
	"context"
	"fmt"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// This functions is called when the app is shutting down
// Should save data and perform other cleanup tasks
func (a *App) OnShutDown(ctx context.Context) {
	fmt.Println("Shutdown on signal")
}

// Create a new settings window
func (a *App) OpenSettings() string {
	fmt.Println("Open Settings")
	return "Open Settings"
}

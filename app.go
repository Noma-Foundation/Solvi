package main

import (
	"context"
	"orderhub/internal"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

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
	a.ctx = ctx
	a.hub.Init(ctx)
	runtime.LogInfo(ctx, "OrderHub environment started successfully")
}

// shutdown is called when the app is closing.
func (a *App) shutdown(ctx context.Context) {
	runtime.LogInfo(ctx, "OrderHub environment shutting down")
}

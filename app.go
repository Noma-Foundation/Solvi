package main

import (
	"context"
	"orderhub/internal/utils"

	"github.com/wailsapp/wails/v2/pkg/runtime"
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
	runtime.LogInfo(ctx, "OrderHub environment started successfully")
}

// shutdown is called when the app is closing.
func (a *App) shutdown(ctx context.Context) {
	runtime.LogInfo(ctx, "OrderHub environment shutting down")
}

func (a *App) OpenTerminal() error {
	opener, err := utils.NewSystemTerminalOpener()

	if err != nil {
		runtime.LogError(a.ctx, "Error creating terminal opener struct:"+err.Error())
		return err
	}
	return opener.OpenTerminal()
}

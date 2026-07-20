package main

import (
	"embed"
	"fmt"
	"strconv"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"

	"orderhub/internal"
	"orderhub/internal/core"
)

//go:embed all:frontend/dist
var assets embed.FS

//go:embed all:binaries/pqsql
var pgBinaries embed.FS

func main() {
	/*
	 * This is the main entry point for the OrderHub application.
	 * This function contains the logic for initializing and running the application. Furthermore,
	 * She represents the creation and execution of the Wails application.
	 */
	hub := internal.NewOrderHub()

	entries, _ := pgBinaries.ReadDir("binaries/pqsql")
	fmt.Println("DEBUG | Postgres files bundled: ", strconv.Itoa(len(entries)))

	app := NewApp(hub)
	appMenu := core.BuildMenuBar()

	err := wails.Run(&options.App{
		Title:  "OrderHub",
		Width:  1024,
		Height: 768,
		Menu:   appMenu,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 255, G: 255, B: 255, A: 255},
		OnStartup:        app.startup,
		OnShutdown:       app.shutdown,
		Bind: []any{
			app,
			hub,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}

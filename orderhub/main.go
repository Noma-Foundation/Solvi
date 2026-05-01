package main

import (
	"embed"
	"fmt"
	"runtime"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/menu"
	"github.com/wailsapp/wails/v2/pkg/menu/keys"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	/*
	 * This is the main entry point for the OrderHub application.
	 * This function contains the logic for initializing and running the application. Furthermore,
	 * She represents the creation and execution of the Wails application.
	 * The only logic present in this function is the creation of the application and
	 * Configuration of the menu.
	 */
	app := NewApp()

	AppMenu := menu.NewMenu()

	// Add platform-specific menus for MacOS
	if runtime.GOOS == "darwin" {
		AppMenu.Append(menu.AppMenu())
	}

	OrderMenu := AppMenu.AddSubmenu("Orders")
	OrderMenu.AddText("Add Order", nil, func(_ *menu.CallbackData) {
		// Request to add a new order
		var message string
		message = "Add a new order"
		fmt.Println(message)
	})
	OrderMenu.AddText("Search Orders", keys.CmdOrCtrl("s"), func(_ *menu.CallbackData) {
		// Search for a specific order
	})
	OrderMenu.AddText("Set Order", keys.CmdOrCtrl("n"), func(_ *menu.CallbackData) {
		// Open the set order dialog
	})

	CustomerMenu := AppMenu.AddSubmenu("Customers")
	CustomerMenu.AddText("Add Customer", nil, func(_ *menu.CallbackData) {
		// Request to add a new customer
	})
	CustomerMenu.AddText("Search Customers", nil, func(_ *menu.CallbackData) {
		// Search for a specific customer
	})
	CustomerMenu.AddText("Edit Customer", nil, func(_ *menu.CallbackData) {
		// Edit customer details
	})

	HelpMenu := AppMenu.AddSubmenu("Help")
	HelpMenu.AddText("&Docs", keys.CmdOrCtrl("o"), func(_ *menu.CallbackData) {
		// Open the documentation URL in the default browser
	})

	// Add platform-specific menus for Windows/Linux. Edit menu is not available on MacOS.
	if runtime.GOOS != "darwin" {
		AppMenu.Append(menu.EditMenu())
	}

	err := wails.Run(&options.App{
		Title:  "OrderHub",
		Width:  1024,
		Height: 768,
		Menu:   AppMenu,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 255, G: 255, B: 255, A: 1},
		OnStartup:        app.startup,
		Bind: []interface{}{
			app,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}

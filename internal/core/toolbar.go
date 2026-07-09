package core

import (
	"fmt"
	"runtime"

	"github.com/wailsapp/wails/v2/pkg/menu"
	"github.com/wailsapp/wails/v2/pkg/menu/keys"
)

func NewMenuBar() *menu.Menu {
	mainMenu := menu.NewMenu()
	return mainMenu
}

func AppendMacOSMenu(mainMenu *menu.Menu) {
	// Add platform-specific menus for MacOS
	if runtime.GOOS == "darwin" {
		fmt.Println("Appending menu for MacOS System")
		mainMenu.Append(menu.AppMenu())
	}
}

func AppendLinuxWindowsMenu(mainMenu *menu.Menu) {
	// Add platform-specific menus for Windows/Linux. Edit menu is not available on MacOS.
	if runtime.GOOS != "darwin" {
		mainMenu.Append(menu.EditMenu())
	}
}

func AddOrderMenu(mainMenu *menu.Menu) {
	orderMenu := mainMenu.AddSubmenu("Orders")
	orderMenu.AddText("Add Order", nil, func(_ *menu.CallbackData) {
		// Request to add a new order
		message := "Add a new order"
		fmt.Println(message)
	})
	orderMenu.AddText("Search Orders", keys.CmdOrCtrl("f"), func(_ *menu.CallbackData) {
		// Search for a specific order
	})
	orderMenu.AddText("Set Order", keys.CmdOrCtrl("n"), func(_ *menu.CallbackData) {
		// Open the set order dialog
	})
}

func AddCustomerMenu(mainMenu *menu.Menu) {
	customerMenu := mainMenu.AddSubmenu("Customers")
	customerMenu.AddText("Add Customer", nil, func(_ *menu.CallbackData) {
		// Request to add a new customer
	})
	customerMenu.AddText("Search Customers", nil, func(_ *menu.CallbackData) {
		// Search for a specific customer
	})
	customerMenu.AddText("Edit Customer", nil, func(_ *menu.CallbackData) {
		// Edit customer details
	})
}

func AddHelpMenu(mainMenu *menu.Menu) {
	helpMenu := mainMenu.AddSubmenu("Help")
	helpMenu.AddText("&Docs", keys.CmdOrCtrl("o"), func(_ *menu.CallbackData) {
		// Open the documentation URL in the default browser
	})
}

func BuildMenuBar() *menu.Menu {
	/*
	 * Builds the application menu bar.
	 */
	mainMenu := NewMenuBar()
	AppendMacOSMenu(mainMenu)
	AppendLinuxWindowsMenu(mainMenu)

	AddOrderMenu(mainMenu)
	AddCustomerMenu(mainMenu)
	AddHelpMenu(mainMenu)
	return mainMenu
}

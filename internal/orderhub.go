package internal

import (
	"context"
	"database/sql"
	"orderhub/internal/database"
	"orderhub/internal/utils"

	"github.com/wailsapp/wails/v2/pkg/runtime"
	"golang.org/x/crypto/bcrypt"
)

// OrderHub is the main struct for the application.
// Contains all configurations and utility tools
type OrderHub struct {
	ctx context.Context
	DB  *sql.DB
}

// NewOrderHub creates a new OrderHub instance without a context.
// Call Init(ctx) inside the Wails startup hook to inject the runtime context.
func NewOrderHub() *OrderHub {
	return &OrderHub{}
}

// Init injects the Wails runtime context. Must be called inside the startup hook.
func (o *OrderHub) Init(ctx context.Context) {
	o.ctx = ctx
}

func (o *OrderHub) OpenTerminal() error {
	opener, err := utils.NewSystemTerminalOpener()

	if err != nil {
		runtime.LogError(o.ctx, "Error creating terminal opener: "+err.Error())
		return err
	}
	return opener.OpenTerminal()
}

func (o *OrderHub) AuthLogin(username string, password string) bool {
	if !database.ValidadeEmployeeExists(username) {
		return false
	}

	hashPassword, err := database.GetPasswordHashByUsername(username)
	if err != nil {
		runtime.LogError(o.ctx, "Error trying to get password hash: "+err.Error())
		return false
	}

	err = bcrypt.CompareHashAndPassword([]byte(hashPassword), []byte(password))
	if err != nil {
		return false
	}

	return true
}

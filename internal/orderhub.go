package internal

import (
	"context"
	"orderhub/internal/utils"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type OrderHub struct {
	ctx context.Context
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

package internal

import (
	"context"
	"database/sql"
	"errors"
	"orderhub/internal/utils"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type TicketView struct {
	ID      string `json:"id"`
	Client  string `json:"client"`
	Budget  string `json:"budget"`
	Address string `json:"address"`
	Desc    string `json:"desc"`
}

// OrderHub is the main struct for the application.
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

// GetTickets fetches the latest tickets from the database.
func (o *OrderHub) GetTickets() ([]TicketView, error) {
	if o.DB == nil {
		return nil, errors.New("database not connected")
	}

	query := "SELECT id, client_name, budget, address, description FROM budget ORDER BY id DESC LIMIT 10"
	rows, err := o.DB.Query(query)
	if err != nil {
		runtime.LogError(o.ctx, "Failed to fetch tickets: "+err.Error())
		return nil, err
	}
	defer rows.Close()

	var tickets []TicketView
	for rows.Next() {
		var t TicketView
		if err := rows.Scan(&t.ID, &t.Client, &t.Budget, &t.Address, &t.Desc); err != nil {
			return nil, err
		}
		tickets = append(tickets, t)
	}

	return tickets, nil
}

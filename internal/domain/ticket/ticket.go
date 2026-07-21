package ticket

import "time"

type Ticket struct {
	ID        string    `json:"id" db:"id"`
	Terant    string    `json:"cliente_id" db:"cliente_id"`
	Customer  string    `json:"customer_id" db:"customer_id"`
	Content   string    `json:"content" db:"content"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}

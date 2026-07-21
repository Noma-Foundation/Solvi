package ticket

import "time"

type Terant struct {
}

type Customer struct {
}

type Ticket struct {
	ID        string
	Terant    Terant
	Customer  Customer
	Content   string
	CreatedAt time.Time
	UpdatedAt time.Time
}

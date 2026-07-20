package internal

import (
	"orderhub/internal/database"
	"os"
)

type ServerSetting struct {
	RunMode      string // debug, test, production
	BindAddress  string // Remove IP from here
	HTTPPort     string
	DatabasePort string
	DatabaseHost string
}

type Config struct {
	DatabaseConnection *database.DatabaseConnection
	OrderHub           *OrderHub
	ServerSetting      *ServerSetting
	fileSetting        *os.File
}

func NewServerSetting() *ServerSetting {
	serverSetting := &ServerSetting{
		RunMode:      "debug",
		BindAddress:  "[IP_ADDRESS]",
		HTTPPort:     "8080",
		DatabasePort: database.Port,
		DatabaseHost: database.Host,
	}

	return serverSetting
}

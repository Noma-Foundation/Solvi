package internal

import (
	"orderhub/internal/database"
	"os"
)

type ServerSetting struct {
	RunMode      string // debug, release, test
	BindAddress  string
	HTTPPort     uint16
	DatabasePort uint16
	DatabaseHost string
}

type Config struct {
	DatabaseConnection *database.DatabaseConnection
	OrderHub           *OrderHub
	ServerSetting      *ServerSetting
	fileSetting        *os.File
}

package internal

import (
	"orderhub/internal/database"
	"os"
)

var (
	User     = "postgres"
	Host     = "localhost"
	Port     = "5432"
	Password = "admin" // Change password later
)

type ServerSetting struct {
	RunMode         string // debug, test, production
	UnusedIPAddress string
	HTTPPort        string
	DatabasePort    string
	DatabaseHost    string
}

type Config struct {
	DatabaseConnection *database.DatabaseConnection
	OrderHub           *OrderHub
	ServerSetting      *ServerSetting
	fileSetting        *os.File
}

func NewServerSetting() *ServerSetting {
	serverSetting := &ServerSetting{
		RunMode:         "debug",
		UnusedIPAddress: "[IP_ADDRESS]",
		HTTPPort:        "8080",
		DatabasePort:    Port,
		DatabaseHost:    Host,
	}

	return serverSetting
}

func NewConfig() *Config {
	return &Config{}
}

func (c *Config) SetDatabaseConnection(db *database.DatabaseConnection) {
	c.DatabaseConnection = db
}

func (c *Config) SetOrderHub(o *OrderHub) {
	c.OrderHub = o
}

func (c *Config) SetServerSetting(s *ServerSetting) {
	c.ServerSetting = s
}

func (c *Config) GetSettingFile() (*os.File, error) {
	return c.fileSetting, nil
}

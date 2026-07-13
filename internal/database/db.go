package database

type DatabaseConnection struct {
	DatabaseName string
	IsConnected  bool
}

func NewDatabaseConnection() (*DatabaseConnection, error) {
	return &DatabaseConnection{}, nil
}

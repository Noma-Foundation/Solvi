package database

type DatabaseService interface {
	Connect(database string) error
	Save(configFile DatabaseConnection) error
	Disconnect() error
}

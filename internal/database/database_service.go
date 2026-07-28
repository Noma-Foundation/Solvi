package database

type DatabaseConfigFile struct {
	DatabaseName string
	FilePath     string
}

type DatabaseService interface {
	Save(configFile DatabaseConfigFile) error
}

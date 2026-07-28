package database

import (
	"errors"
	"os"

	"github.com/BurntSushi/toml"
)

type appConfig struct {
	Global         globalConfig      `toml:"global"`
	Database       databaseConfig    `toml:"database"`
	SupportAuth    supportAuthConfig `toml:"support-auth"`
	Vars           varsConfig        `toml:"vars"`
	EditorSettings editorSettings    `toml:"editor-settings"`
}

type globalConfig struct {
	Name           string `toml:"name"`
	Version        string `toml:"version"`
	CompanyName    string `toml:"companyName"`
	Timezone       string `toml:"timezone"`
	Environment    string `toml:"environment"`
	Debug          bool   `toml:"debug"`
	BaseURL        string `toml:"base_url"`
	MaintainceMode bool   `toml:"maintaince_mode"`
}

type databaseConfig struct {
	Name     string `toml:"name"`
	Host     string `toml:"host"`
	Port     string `toml:"port"`
	PoolSize int    `toml:"pool_size"`
	SSLMode  string `toml:"ssl_mode"`
}

type supportAuthConfig struct {
	Name     string `toml:"name"`
	Password string `toml:"password"`
}

type varsConfig struct {
	RedisURL          string `toml:"redis_url"`
	SMTPHost          string `toml:"smtp_host"`
	SMTPPort          string `toml:"smtp_port"`
	MaxUploadFileSize string `toml:"max_upload_file_size"`
}

type editorSettings struct {
	Theme            string   `toml:"theme"`
	FontSize         int      `toml:"font-size"`
	FontForHeaders   string   `toml:"font-for-headers"`
	AutoSave         bool     `toml:"auto-save"`
	AllowedFileTypes []string `toml:"allowed_file_types"`
}

type DatabaseServiceImpl struct{}

func NewDatabaseService() DatabaseService {
	return &DatabaseServiceImpl{}
}

func (s *DatabaseServiceImpl) Save(configFile DatabaseConfigFile) error {
	if configFile.DatabaseName == "" {
		return errors.New("DatabaseName cannot be empty")
	}
	if configFile.FilePath == "" {
		return errors.New("FilePath cannot be empty")
	}

	var cfg appConfig
	if _, err := toml.DecodeFile(configFile.FilePath, &cfg); err != nil {
		return errors.New("failed to read config file: " + err.Error())
	}

	cfg.Database.Name = configFile.DatabaseName

	f, err := os.Create(configFile.FilePath)
	if err != nil {
		return errors.New("failed to open config file for writing: " + err.Error())
	}
	defer f.Close()

	if err := toml.NewEncoder(f).Encode(cfg); err != nil {
		return errors.New("failed to encode config file: " + err.Error())
	}

	return nil
}

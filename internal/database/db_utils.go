package database

import "fmt"

func PrintDatabaseInfo(db *DatabaseConnection) {
	conn := db
	fmt.Println("DEBUG | Database:", conn.DatabaseName, conn.ConnectedAt, conn.IsConnected)
}

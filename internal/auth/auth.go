package auth

import (
	"net/http"
)

func loginHandler(w http.ResponseWriter, r *http.Request) {
	adminUsername := "admin"
	adminUserPassword := "admin"

	println("INF | Login attempt username: " + adminUsername)
	println("INF | Login attempt password: " + adminUserPassword)
}

func protectedHandler(w http.ResponseWriter, r *http.Request) {
	println("INF | Protected endpoint")
}

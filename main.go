package main

import (
	"os"
	"fmt"
	"log"
	"net/http"
)

var port = os.Getenv("PORT")

func rootHanderler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Hello Heroku!")
}

func main() {
	if port == "" {
		port = "8080"
	}

	http.HandleFunc("/", rootHanderler)
	log.Fatal(http.ListenAndServe(":" + port, nil))
}

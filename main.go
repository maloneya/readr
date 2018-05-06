package main

import (
	"fmt"
	"log"
	"net/http"
)

func rootHanderler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Hello Heroku!")
}

func main() {
	http.HandleFunc("/", rootHanderler)
	log.Fatal(http.ListenAndServe(":5000", nil))
}

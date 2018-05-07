package main

import (
	"os"
	"fmt"
	"log"
	"net/http"
	"encoding/json"
)

type Data struct {
	Text string
}

func apiHandler(w http.ResponseWriter, r *http.Request) {
	d := Data{Text: "hello react!"}
	res, err := json.Marshal(d)
	if err != nil {
		log.Fatal("Data could not be Marshaled")
	}
	fmt.Fprintf(w, string(res))
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	http.HandleFunc("/api/test", apiHandler)
	http.Handle("/", http.FileServer(http.Dir("./build")))
	log.Println("Server started on " + port)
	log.Fatal(http.ListenAndServe(":" + port, nil))
}

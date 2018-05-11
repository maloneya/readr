package main

import (
	"os"
	"fmt"
	"log"
	"net/http"
	"encoding/json"
)

type Book struct {
	Title string
	Author string
}

type ReadingList struct {
	Books []Book
}

func apiHandler(w http.ResponseWriter, r *http.Request) {
	d := Book{Title: "Atlas Shrugged", Author: "Ayan Rand"}
	d2 := Book{Title: "Baraay boogle", Author: "Sam Slice"}
	books := ReadingList{Books: []Book{d,d2}}

	res, err := json.Marshal(books)
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

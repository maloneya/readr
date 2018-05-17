package main

import (
	"os"
	"io/ioutil"
	"fmt"
	"log"
	"net/http"
	"encoding/json"
)

type Book struct {
	Title string
	Author string
}

//FIXME HATE THIS
type Book_data struct {
	List_id int
}

type ReadingList struct {
	Books []Book
}

func getList(w http.ResponseWriter, r *http.Request) {
	d := Book{Title: "Atlas Shrugged", Author: "Ayan Rand"}
	d2 := Book{Title: "Baraay boogle", Author: "Sam Slice"}
	books := ReadingList{Books: []Book{d,d2}}

	res, err := json.Marshal(books)
	if err != nil {
		log.Fatal("Data could not be Marshaled")
	}
	fmt.Fprintf(w, string(res))
}

func addBook(w http.ResponseWriter, r *http.Request) {
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		log.Println("add book parse failed")
	}
	var book Book
	err = json.Unmarshal(body, &book)
	if err != nil {
		log.Println("json unmarshal fail add book")
	}
	log.Println(book)
}

func remBook(w http.ResponseWriter, r *http.Request) {
	body, err := ioutil.ReadAll(r.Body)
	log.Println(body)

	if err != nil {
		log.Println("rem book parse failed")
	}
	var data Book_data
	err = json.Unmarshal(body, &data)
	if err != nil {
		log.Println("json unmarshal fail rem book")
	}
	log.Println(data)
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	http.HandleFunc("/api/getList", getList)
	http.HandleFunc("/api/addBook", addBook)
	http.HandleFunc("/api/remBook", remBook)

	http.Handle("/", http.FileServer(http.Dir("./build")))
	log.Println("Server started on " + port)
	log.Fatal(http.ListenAndServe(":" + port, nil))
}

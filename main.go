package main

import (
	"os"
	"io/ioutil"
	"fmt"
	"log"
	"net/http"
	"encoding/json"
	"database/sql"
	 _ "github.com/lib/pq"
)

var db *sql.DB

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
	var (
		title, author string
		books []Book
	)

	rows, err := db.Query("SELECT * FROM books")
	if err != nil {
		log.Fatalf("getList querry fail: %q", err)
	}
	defer rows.Close()
	//optimize slice usage here
	for rows.Next() {
		err := rows.Scan(&title,&author)
		if err != nil {
			log.Fatalf("Row scan error: %q", err)
		}
		books = append(books, Book{Title: title, Author: author})
	}

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
	insertStatement := "INSERT INTO books VALUES ($1, $2)"
	db.Exec(insertStatement, book.Title, book.Author)
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
	db, err := sql.Open("postgres", os.Getenv("DATABSE_URL"))
	if err != nil {
		log.Fatalf("Error opening database: %q", err)
	}
	_, err = db.Exec(`CREATE TABLE IF NOT EXISTS books (
			Title varchar(255),
			Author varchar(255)
	)`)
	if err != nil {
		log.Fatalf("Error creating db: %q", err)
	}

	http.HandleFunc("/api/getList", getList)
	http.HandleFunc("/api/addBook", addBook)
	http.HandleFunc("/api/remBook", remBook)

	http.Handle("/", http.FileServer(http.Dir("./build")))
	log.Println("Server started on " + port)
	log.Fatal(http.ListenAndServe(":" + port, nil))
}

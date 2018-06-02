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
	User_id string
}

type User struct {
	User_id string
}

type Article struct {
	Title string
	Publication string
	URL string
	User_id string
}

type ReadingList struct {
	Books []Book
	Articles []Article
}

func getList(w http.ResponseWriter, r *http.Request, data interface{}) {
	var list ReadingList
	getBooks(list, user.User_id)
	getArticles(list, user.User_id)

	res, err := json.Marshal(list)
	if err != nil {
		log.Fatal("Data could not be Marshaled")
	}
	fmt.Fprintf(w, string(res))
}

func getBooks(list *ReadingList, user_id string) {
	rows, err := db.Query(BookGet, user_id)
	if err != nil {
		log.Fatalf("getBooks querry fail: %q", err)
	}
	defer rows.Close()

	var title, author string
	for rows.Next() {
		err := rows.Scan(&title,&author)
		if err != nil {
			log.Fatalf("Row scan error: %q", err)
		}
		list.Books = append(list.Books, Book{Title: title, Author: author})
	}
}

func getArticles(list *ReadingList, user_id string) {
	rows, err := db.Query(ArticleGet, user_id)
	if err != nil {
		log.Fatalf("getList querry fail: %q", err)
	}
	defer rows.Close()

	var title, publication, url string
	for rows.Next() {
		err := rows.Scan(&title,&publication,&url)
		if err != nil {
			log.Fatalf("Row scan error: %q", err)
		}
		list.Articles = append(list.Articles, Article{Title: title, Publication: publication, URL: url})
	}
}

func addBook(w http.ResponseWriter, r *http.Request, data interface{}) {
	book := data.(Book)
	db.Exec(BookInsert, book.Title, book.Author, book.User_id)
}

func remBook(w http.ResponseWriter, r *http.Request, data interface{}) {
	book := data.(Book)
	res, err := db.Exec(BookDelete,book.Title, book.Author, book.User_id)
	if err != nil {
		log.Println(err)
	}
	log.Println(res.RowsAffected())
}

func addArticle(w http.ResponseWriter, r *http.Request, data interface{}) {
	article := data.(Article)
	db.Exec(ArticleInsert, article.Title, article.Publication, article.URL, article.User_id)
}

func remArticle(w http.ResponseWriter, r *http.Request, data interface{}) {
	article := data.(Article)
	res err := db.Exec(ArticleDelete, article.URL, article.User_id)
	if err != nil {
		log.Println(err)
	}
	log.Println(res.RowsAffected())
}

func dbSetup() {
	//FIXME enable ssl
	db_url := os.Getenv("DATABASE_URL") + "?sslmode=disable";
	log.Println(db_url)

	var err error
	db, err = sql.Open("postgres", db_url)
	if err != nil {
		log.Fatalf("Error opening database: %q", err)
	}

	_, err = db.Exec(BookTableCreate)
	if err != nil {
		log.Fatalf("Error creating db: %q", err)
	}

	_, err = db.Exec(ArticleTableCreate)
	if err != nil {
		log.Fatalf("Error creating db: %q", err)
	}
}

func makePostHandler(fn func(http.ResponseWriter, *http.Request, interface{}), data interface{}) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		body, err := ioutil.ReadAll(r.Body)
		if err != nil {
			log.Println("rem book parse failed")
		}
		err = json.Unmarshal(body, &data)
		if err != nil {
			log.Println("json unmarshal fail rem book")
		}
		log.Println(data)
		fn(w,r,data)
	}
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	dbSetup()

	http.HandleFunc("/api/getList", makePostHandler(getList,User{}))
	http.HandleFunc("/api/addBook", makePostHandler(addBook,Book{}))
	http.HandleFunc("/api/remBook", makePostHandler(remBook,Book{}))
	http.HnadleFunc("/api/remArticle", makePostHandler(remArticle,Article{}))
	http.HnadleFunc("/api/remArticle", makePostHandler(remArticle,Article{}))

	http.Handle("/", http.FileServer(http.Dir("./build")))
	log.Println("Server started on " + port)
	log.Fatal(http.ListenAndServe(":" + port, nil))
}

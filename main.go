package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strings"

	_ "github.com/lib/pq"
)

var db *sql.DB

type request struct {
	Title, Author, Publication, URL, UserID, ReqType, AddedBy string
}

type book struct {
	Title, Author, UserID, AddedBy string
}

type article struct {
	Title, Publication, URL, UserID, AddedBy string
}

type readingList struct {
	Books    []book
	Articles []article
}

func getLinkData(url string) (title, publication string) {
	resp, err := http.Get(url)
	if err != nil {
		log.Fatalf("get link failed %q", err)
	}
	var body []byte
	body, err = ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Fatalf("Get link data: %q", err)
	}

	rawHTML := string(body)
	titleHTML := rawHTML[strings.Index(rawHTML, "title"):]
	titlePub := titleHTML[strings.Index(titleHTML, ">")+1 : strings.Index(titleHTML, "</")]
	data := strings.Split(titlePub, "-")
	title = data[0]

	if len(data) != 2 {
		title = titlePub
		publication = resp.Request.URL.Host
		start := strings.Index(publication, ".")
		end := strings.LastIndex(publication, ".")
		if start == end {
			publication = publication[:start]
		} else {
			publication = publication[start+1 : end]
		}
	} else {
		publication = data[1]
	}

	return
}

func getList(w http.ResponseWriter, r *http.Request) {
	var list = readingList{}
	user := request{}
	parseRequest(r, &user)

	log.Printf(user.UserID)
	getBooks(&list, user.UserID)
	getArticles(&list, user.UserID)

	res, err := json.Marshal(list)
	if err != nil {
		log.Fatal("Data could not be Marshaled")
	}
	fmt.Fprintf(w, string(res))
}

func getBooks(list *readingList, userID string) {
	rows, err := db.Query(BookGet, userID)
	if err != nil {
		log.Fatalf("getBooks querry fail: %q", err)
	}
	defer rows.Close()

	var title, author, addedBy string
	for rows.Next() {
		err := rows.Scan(&title, &author, &addedBy)
		if err != nil {
			log.Fatalf("Row scan error: %q", err)
		}
		list.Books = append(list.Books, book{Title: title, Author: author, AddedBy: addedBy})
	}
}

func getArticles(list *readingList, userID string) {
	rows, err := db.Query(ArticleGet, userID)
	if err != nil {
		log.Fatalf("getArticles querry fail: %q", err)
	}
	defer rows.Close()

	var title, publication, url, addedBy string
	for rows.Next() {
		err := rows.Scan(&title, &publication, &url, &addedBy)
		if err != nil {
			log.Fatalf("Row scan error: %q", err)
		}
		list.Articles = append(list.Articles, article{Title: title, Publication: publication, URL: url, AddedBy: addedBy})
	}
}

func acceptShare(w http.ResponseWriter, r *http.Request) {
	req := request{}
	parseRequest(r, &req)

	switch req.ReqType {
	case "book":
		db.Exec(BookUpdate, req.UserID, req.Title, req.Author, req.UserID)
	case "article":
		db.Exec(ArticleUpdate, req.UserID, req.URL, req.UserID)
	}
}

func addBook(w http.ResponseWriter, r *http.Request) {
	book := request{}
	parseRequest(r, &book)

	db.Exec(BookInsert, book.Title, book.Author, book.UserID, book.AddedBy)
}

func remBook(w http.ResponseWriter, r *http.Request) {
	book := request{}
	parseRequest(r, &book)

	res, err := db.Exec(BookDelete, book.Title, book.Author, book.UserID)
	if err != nil {
		log.Println(err)
	}
	log.Println(res.RowsAffected())
}

func addArticle(w http.ResponseWriter, r *http.Request) {
	url := request{}
	parseRequest(r, &url)
	title, publication := getLinkData(url.URL)
	newArticle := article{title, publication, url.URL, url.UserID, url.AddedBy}
	db.Exec(ArticleInsert, newArticle.Title, newArticle.Publication, newArticle.URL, newArticle.UserID, newArticle.AddedBy)
	//send article meta data back to client
	res, err := json.Marshal(newArticle)
	if err != nil {
		log.Fatal("Data could not be Marshaled")
	}
	fmt.Fprintf(w, string(res))

}

func remArticle(w http.ResponseWriter, r *http.Request) {
	article := request{}
	parseRequest(r, &article)
	log.Printf(article.URL)
	log.Printf(article.UserID)
	res, err := db.Exec(ArticleDelete, article.URL, article.UserID)
	if err != nil {
		log.Println(err)
	}
	log.Println(res.RowsAffected())
}

func dbSetup() {
	//FIXME enable ssl
	dbURL := os.Getenv("DATABASE_URL") + "?sslmode=disable"
	log.Println(dbURL)

	var err error
	db, err = sql.Open("postgres", dbURL)
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

func parseRequest(r *http.Request, data *request) {
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		log.Println("parse request failed")
	}

	err = json.Unmarshal(body, data)
	if err != nil {
		log.Printf("json unmarshal fail parse request: %q", err)
	}
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	} else {
		http.Handle("/", http.FileServer(http.Dir("./build")))
	}

	dbSetup()

	http.HandleFunc("/api/getList", getList)
	http.HandleFunc("/api/addBook", addBook)
	http.HandleFunc("/api/remBook", remBook)
	http.HandleFunc("/api/remArticle", remArticle)
	http.HandleFunc("/api/addArticle", addArticle)
	http.HandleFunc("/api/acceptShare", acceptShare)

	log.Println("Server started on " + port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}

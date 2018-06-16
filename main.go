package main

import (
	"os"
	"io/ioutil"
	"fmt"
	"strings"
	"log"
	"net/http"
	"encoding/json"
	"database/sql"
	 _ "github.com/lib/pq"
)

var db *sql.DB

type Request struct {
	Title, Author, Publication, URL, User_id string
}

type Book struct {
	Title, Author, User_id string
}

type Article struct {
	Title, Publication, URL, User_id string
}

type ReadingList struct {
	Books []Book
	Articles []Article
}

func getLinkData(url string) (title, publication string) {
	resp,err := http.Get(url)
	if err != nil {
		log.Fatalf("get link failed %q", err)
	}
	var body []byte
	body,err = ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Fatalf("Get link data: %q",err)
	}

	raw_html := string(body)
	title_html := raw_html[strings.Index(raw_html,"title"):]
	title_and_pub := title_html[strings.Index(title_html,">") + 1:strings.Index(title_html,"</")]
	data := strings.Split(title_and_pub,"-")
	title = data[0]

	if (len(data) != 2) {
		title = title_and_pub
		publication = resp.Request.URL.Host
		start := strings.Index(publication,".")
		end := strings.LastIndex(publication,".")
		if start == end {
			publication = publication[:start]
		} else {
			publication = publication[start+1:end]
		}
	} else {
		publication = data[1]
	}

	return
}

func getList(w http.ResponseWriter, r *http.Request) {
	var list ReadingList = ReadingList{}
	user := Request{}
	parseRequest(r,&user)

	log.Printf(user.User_id)
	getBooks(&list, user.User_id)
	getArticles(&list, user.User_id)

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
		log.Fatalf("getArticles querry fail: %q", err)
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

func addBook(w http.ResponseWriter, r *http.Request) {
	book := Request{}
	parseRequest(r,&book)

	db.Exec(BookInsert, book.Title, book.Author, book.User_id)
}

func remBook(w http.ResponseWriter, r *http.Request) {
	book := Request{}
	parseRequest(r,&book)

	res, err := db.Exec(BookDelete,book.Title, book.Author, book.User_id)
	if err != nil {
		log.Println(err)
	}
	log.Println(res.RowsAffected())
}

func addArticle(w http.ResponseWriter, r *http.Request) {
	url := Request{}
	parseRequest(r,&url)
	title, publication := getLinkData(url.URL)
	article := Article{title,publication,url.URL,url.User_id}
	db.Exec(ArticleInsert, article.Title, article.Publication, article.URL, article.User_id)
	//send article meta data back to client
	res, err := json.Marshal(article)
	if err != nil {
		log.Fatal("Data could not be Marshaled")
	}
	fmt.Fprintf(w, string(res))

}

func remArticle(w http.ResponseWriter, r *http.Request) {
	article := Request{}
	parseRequest(r,&article)
	log.Printf(article.URL)
	log.Printf(article.User_id)
	res, err := db.Exec(ArticleDelete, article.URL, article.User_id)
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

func parseRequest(r *http.Request, data *Request) {
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		log.Println("parse reqeust failed")
	}

	err = json.Unmarshal(body, data)
	if err != nil {
		log.Println("json unmarshal fail parse request: %q", err)
	}
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	dbSetup()

	http.HandleFunc("/api/getList", getList)
	http.HandleFunc("/api/addBook", addBook)
	http.HandleFunc("/api/remBook", remBook)
	http.HandleFunc("/api/remArticle", remArticle)
	http.HandleFunc("/api/addArticle", addArticle)


	http.Handle("/", http.FileServer(http.Dir("./build")))
	log.Println("Server started on " + port)
	log.Fatal(http.ListenAndServe(":" + port, nil))
}

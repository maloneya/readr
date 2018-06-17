package main

//BookInsert - Insert new book
const BookInsert = "INSERT INTO books VALUES ($1, $2, $3, $4);"

//BookDelete - Delete book
const BookDelete = "DELETE FROM books WHERE Title=$1 AND Author=$2 AND userID=$3;"

//BookGet - get book for userid
const BookGet = "SELECT title, author, addedBy FROM books WHERE userID=$1"

//BookUpdate - update added by field on book
const BookUpdate = "UPDATE books SET addedBy = $1 WHERE title=$2 AND author=$3 AND userID=$4"

//BookTableCreate - create the book table
const BookTableCreate = `CREATE TABLE IF NOT EXISTS books (
        Title varchar(255),
        Author varchar(255),
        userID varchar(255),
        addedBy varchar(255),
        PRIMARY KEY (Title,Author,userID));`

//ArticleInsert - Insert new article
const ArticleInsert = "INSERT INTO articles VALUES ($1, $2, $3, $4, $5);"

//ArticleDelete - delete an artilce for user and url
const ArticleDelete = "DELETE FROM articles WHERE URL=$1 AND userID=$2"

//ArticleGet - get a users articles
const ArticleGet = "SELECT title, publication, URL, addedBy FROM articles WHERE userID=$1"

//ArticleUpdate - update adedby field on articel
const ArticleUpdate = "UPDATE articles SET addedBy=$1 WHERE URL=$2 AND userID=$3;"

//ArticleTableCreate - create article table
const ArticleTableCreate = `CREATE TABLE IF NOT EXISTS articles (
        Title varchar(255),
        Publication varchar(255),
        URL varchar(255),
        userID varchar(255),
        addedBy varchar(255),
        PRIMARY KEY (URL,userID));`

package main

const BookInsert = "INSERT INTO books VALUES ($1, $2, $3);"
const BookDelete = "DELETE FROM books WHERE Title=$1 AND Author=$2 AND userID=$3;"
const BookGet = "SELECT title, author FROM books WHERE userID=$1"

const BookTableCreate = `CREATE TABLE IF NOT EXISTS books (
        Title varchar(255),
        Author varchar(255),
        userID varchar(255))`

const ArticleInsert = "INSERT INTO articles VALUES ($1, $2, $3, $4);"
const ArticleDelete = "DELETE FROM articles WHERE URL=$1 AND userID=$2"
const ArticleGet = "SELECT title, publication, URL FROM articles WHERE userID=$1"

const ArticleTableCreate = `CREATE TABLE IF NOT EXISTS articles (
        Title varchar(255),
        Publication varchar(255),
        URL varchar(255),
        userID varchar(255))`

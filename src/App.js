import React, { Component } from 'react';
import './index.css';


function Login(props) {
    return (
        <div class="Body">
            <div class="pt-card pt-elevation-3">
                <img src="/assets/logo.png" class="Center"/>
                <div class="Center fb-login-button" data-width="400" data-size="large" data-button-type="continue_with" data-show-faces="false" data-auto-logout-link="false" data-use-continue-as="true"></div>
            </div>
        </div>
    );
}

class SearchBar extends Component {
    constructor(props) {
        super(props);
        this.handleFilterTextChange = this.handleFilterTextChange.bind(this);
    }

    handleFilterTextChange(e) {
        this.props.onFilterTextChange(e.target.value);
    }

    render() {
        return (
            <input class="pt-input" placeholder="Search My List..." type="text"
                value={this.props.filterText}
                onChange={this.handleFilterTextChange}
            />
        );
    }
}

function Navbar(props) {
    return (
        <nav class="pt-navbar">
            <div class="pt-navbar-group pt-align-left">
                <div class="pt-navbar-heading">Readr</div>
                <SearchBar filterText={props.filterText} onFilterTextChange={props.onFilterTextChange}/>
            </div>
            <div class="pt-navbar-group pt-align-right">
                <button class="pt-button pt-minimal pt-icon-home">Home</button>
                <button class="pt-button pt-minimal pt-icon-document">List</button>
                <span class="pt-navbar-divider"></span>
                <button class="pt-button pt-minimal pt-icon-user"></button>
                <button class="pt-button pt-minimal pt-icon-notifications"></button>
                <button class="pt-button pt-minimal pt-icon-cog"></button>
            </div>
        </nav>
    );
}

class BookForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            Title: "",
            Author: ""
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        const target = event.target;
        const value = target.value;
        const name = target.name;

        this.setState({
            [name]: value
        });
    }

    handleSubmit() {
        this.props.onSubmit({
            Title: this.state.Title,
            Author: this.state.Author
        });

        this.setState({
            Title: '',
            Author: ''
        })
    }

    render() {
        return (
            <tr>
                <td>
                    <input placeholder="Title" class="pt-input" name="Title" type="text" value={this.state.Title} onChange={this.handleChange} />
                </td>
                <td>
                    <input placeholder="Author" class="pt-input" name="Author" type="text" value={this.state.Author} onChange={this.handleChange} />
                </td>
                <td><button class="pt-button pt-intent-success pt-icon-add" type="button" onClick={this.handleSubmit}/></td>
            </tr>
        );
    }
}

class ArticleForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            URL: "",
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        const target = event.target;
        const value = target.value;
        const name = target.name;

        this.setState({
            [name]: value
        });
    }

    handleSubmit() {
        this.props.onSubmit(this.state.URL);
        this.setState({
            URL: '',
        })
    }

    render() {
        return (
            <tr>
                <td>
                    <input placeholder="URL" class="pt-input" name="URL" type="text" value={this.state.URL} onChange={this.handleChange} />
                </td>
                <td><button class="pt-button pt-intent-success pt-icon-add" type="button" onClick={this.handleSubmit}/></td>
            </tr>
        );
    }
}

class Book extends Component {
    render() {
        return (
            <tr>
                <td>{this.props.Title}</td>
                <td>{this.props.author}</td>
                <td><button type="button" class="pt-button pt-icon-tick" onClick={this.props.onClick}/></td>
            </tr>
        );
    }
}

class Article extends Component {
    render() {
        return (
            <tr>
                <td>{this.props.Title}</td>
                <td>{this.props.publication}</td>
                <td>
                    <div class="pt-button-group Padded">
                        <a name="type" class="pt-button pt-icon-tick" onClick={this.props.onClick} role="button" />
                        <a name="type" class="pt-button pt-icon-document-open" onClick={() => window.open(this.props.url)} role="button" />
                    </div>
                </td>
            </tr>
        );
    }
}

class ReadingList extends Component {
    render() {
        const filterText = this.props.filterText.toLowerCase();
        const books = [];
        const articles = [];

        this.props.books.forEach((book,i) => {
            if ((book.Title + book.Author).toLowerCase().indexOf(filterText) === -1) {
                return;
            }
            books.push(<Book Title={book.Title} author={book.Author} onClick={() => this.props.bookListRemove(i)}/>);
        });

        this.props.articles.forEach((article,i) => {
            if ((article.Title + article.Publication).toLowerCase().indexOf(filterText) === -1) {
                return;
            }
            articles.push(<Article Title={article.Title} publication={article.Publication} url={article.URL} onClick={() => this.props.articleRemove(i)} />);
        })

        return (
            <table class='pt-html-table pt-html-table-striped'>
                <thead>
                    <tr>
                        <th>Title</th><th>Author/Publication</th>
                    </tr>
                </thead>
                {books}
                {articles}
            </table>
        );
    }
}

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userID: '',
            error: null,
            isLoaded: false,
            Books: null,
            Articles: null,
            filterText: '',
            newData: 'book'
        };

        this.handleFilterTextChange = this.handleFilterTextChange.bind(this);
        this.statusChangeCallback = this.statusChangeCallback.bind(this);
    }

    handleFilterTextChange(filterText) {
        this.setState({
            filterText: filterText
        });
    }

    bookListAdd(book) {
        let Books = this.state.Books.slice();
        Books.push(book);
        this.setState({
            Books: Books
        });

        book.User_id = this.state.userID
        postData('/api/addBook',book);
    }

    articleAdd(url) {
        let Articles = this.state.Articles.slice();
        //TODO go get data from url
        let article = {
            Title: "Trump Does dumb shit",
            Publication: "New York Times",
            URL: url
        }
        Articles.push(article)
        this.setState({
            Articles: Articles
        })

        article.User_id = this.state.userID
        //postData('/api/addArticle',article)
    }

    bookListRemove(list_index) {
        let Books = this.state.Books.slice()
        let remed_book = Books.splice(list_index,1);
        this.setState({
            Books: Books
        });

        remed_book[0].User_id = this.state.userID
        postData('/api/remBook',remed_book[0]);
    }

    articleRemove(list_index) {
        let Articles = this.state.Articles.slice()
        let remed_article= Articles.splice(list_index,1)
        this.setState({
            Articles: Articles
        })

        remed_article[0].User_id = this.state.user_id
        //postData('/api/remArticle', remed_article[0])
    }

    statusChangeCallback(login_response) {
        console.log(login_response)
        const user_id = login_response.authResponse.userID
        if (login_response.status === "connected") {
            postData("/api/getList",{User_id: user_id})
                .then(res => res.json())
                .then(
                    (result) => {
                        this.setState({
                            userID: user_id,
                            isLoaded: true,
                            Books: (result.Books !== null) ? result.Books:[],
                            Articles: (result.Articles !== null) ? result.Articles:[]
                        });
                    },
                    (error) => {
                        this.setState({
                            userID: user_id,
                            isLoaded: true,
                            error
                        });
                    }
                )
        }
    }

    componentDidMount() {
        const callback = this.statusChangeCallback;
        window.fbAsyncInit = function() {
            window.FB.init({
                appId      : '225918651336380',
                cookie     : true,
                xfbml      : true,
                version    : 'v3.0'
                });


            window.FB.getLoginStatus(function(response) {
                callback(response);
            });
        };

        (function(d, s, id){
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) {return;}
            js = d.createElement(s); js.id = id;
            js.src = "https://connect.facebook.net/en_US/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));
    }

    //this could use a refactor.
    render() {
        const { userID, error, isLoaded, Books, Articles, newData } = this.state;

        var itemForm;
        if (newData === "book")
            itemForm = <BookForm onSubmit={this.bookListAdd.bind(this)} />
        else
            itemForm = <ArticleForm onSubmit={this.articleAdd.bind(this)} />

        if (userID == '') {
            return <Login />
        } else if (error) {
            return <div>Error: {error.message}</div>;
        } else if (!isLoaded) {
            return <div>Loading ... </div>;
        } else {
            return (
                <div class='Body'>
                    <Navbar filterText={this.state.filterText} onFilterTextChange={this.handleFilterTextChange}/>
                    <div class="pt-card">
                        <ReadingList filterText={this.state.filterText} books={this.state.Books}
                        articles={this.state.Articles}
                        bookListRemove={this.bookListRemove.bind(this)}
                        articleRemove={this.articleRemove.bind(this)}/>
                    </div>
                    <div class="pt-card">
                        <div class="pt-button-group">
                            <a name="type" class="pt-button pt-icon-document" role="button" onClick={() => this.setState({newData:'article'})} />
                            <a name="type" class="pt-button pt-icon-git-repo" role="button" onClick={() => this.setState({newData:'book'})}/>
                        </div>
                        {itemForm}
                    </div>
                </div>
            );
        }
    }
}

function postData(url, data) {
    return fetch(url, {
        body: JSON.stringify(data),
        headers: {
            'content-type': 'application/json'
        },
        method: 'POST',
    })
}

export default App;

import React, { Component } from 'react';
import { Button, Dialog, MenuItem } from "@blueprintjs/core";
import { Suggest } from "@blueprintjs/select";
import './index.css';

function Login(props) {
    return (
        <div class="Body">
            <div class="pt-card pt-elevation-3">
                <img src="/assets/logo.png" class="Center"/>
                <div class="Center fb-login-button" data-onlogin={props.onLogin} data-scope="public_profile,user_friends" data-width="400" data-size="large" data-button-type="continue_with" data-show-faces="false" data-auto-logout-link="false" data-use-continue-as="true"></div>
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


function FriendList(props) {
    let friends = props.friends;
    let share = props.onClick;

    return (
        <Suggest 
            items = {friends}
            inputValueRenderer = {(friend) => friend.name}
            itemPredicate = {(query, friend) => {
                return friend.name.toLowerCase().indexOf(query.toLowerCase()) >= 0;
            }}
            //FIXME - confused by handle click ... cant figure out where that gets passed from
            //so im just ignoring it
            itemRenderer = {(friend, { handleClick, modifiers }) => {
                if (!modifiers.matchesPredicate) {
                    return null;
                }
                return (
                    <MenuItem
                        active={modifiers.active}
                        key={friend.name}
                        label={friend.name}
                        onClick={() => share(friend)}
                    />
                );
            }}
            onItemSelect = {(friend) => share(friend)}
        />
    );
}

class ShareButton extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            friends: []
        }

        this.share = this.share.bind(this)
    }

    getFriends() {
        const shareButton = this;
        window.FB.api(
            '/me',
            'GET',
            {"fields":"id,name,friends"},
            function(response) {
                shareButton.setState({
                    friends: response.friends.data
                })
            }
        );
    }

    share(friend) {
        console.log("share with")
        console.log(friend)
        this.setState({isOpen:false});
        return;
    }

    toggleDialog = () => this.setState({ isOpen: !this.state.isOpen });

    render() {
        return (
            <div>
                <Button onClick={() => {this.toggleDialog();this.getFriends();}} className="pt-icon-share pt-intent-primary" />
                <Dialog
                    icon="inbox"
                    isOpen={this.state.isOpen}
                    onClose={this.toggleDialog}
                    title="Share With"
                >
                    <div className='pt-dialog-body'>
                        <FriendList friends={this.state.friends} onClick={this.share} />
                    </div>
                    <div className="pt-dialog-footer">
                        <div className="pt-dialog-footer-actions">
                            <Button
                                onClick={this.toggleDialog}
                                text="Cancel"
                            />
                        </div>
                    </div>
                </Dialog>
            </div>
        );
    }
}

class Form extends Component {
    constructor(props) {
        super(props);
        this.state = {
            Title: "",
            Author: "",
            URL: ""
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
        if (this.props.type === 'book') {
            this.props.onSubmit({
                Title: this.state.Title,
                Author: this.state.Author
            });
        } else if (this.props.type === 'article') {
            this.props.onSubmit(this.state.URL);
        }

        this.setState({
            Title: '',
            Author: '',
            URL: ''
        })
    }

    render() {
        let inputs;
        if (this.props.type === 'book') {
            inputs = ([
                <td>
                    <input placeholder="Title" class="pt-input" name="Title" type="text" value={this.state.Title} onChange={this.handleChange} />
                </td>,
                <td>
                    <input placeholder="Author" class="pt-input" name="Author" type="text" value={this.state.Author} onChange={this.handleChange} />
                </td>
            ]);
        } else if (this.props.type === 'article') {
            inputs = (
                <td>
                    <input placeholder="URL" class="pt-input" name="URL" type="text" value={this.state.URL} onChange={this.handleChange} />
                </td>
            )
        }

        return (
            <tr>
                {inputs}
                <td>
                    <div class="pt-button-group">
                        <a name="type" class="pt-button pt-intent-success pt-icon-add" onClick={this.handleSubmit} role="button" />
                        <ShareButton />
                    </div>
                </td>
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
                    <div class="pt-button-group">
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

class Readr extends Component {
    constructor(props) {
        super(props);
        this.state = {
            Books: [],
            Articles: [],
            filterText: '',
            newData: 'book'
        }

        this.handleFilterTextChange = this.handleFilterTextChange.bind(this);
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

        book.User_id = this.props.userID
        postData('/api/addBook',book);
    }

    articleAdd(url) {
        let Articles = this.state.Articles.slice();
        let article = {
            URL: url,
            User_id: this.props.userID
        }

        postData('/api/addArticle',article)
            .then(res => res.json())
            .then((result) => {
                article.Title = result.Title;
                article.Publication = result.Publication;

                Articles.push(article);
                this.setState({
                    Articles: Articles
                });
            });
    }

    bookListRemove(list_index) {
        let Books = this.state.Books.slice()
        let remed_book = Books.splice(list_index,1);
        this.setState({
            Books: Books
        });

        remed_book[0].User_id = this.props.userID
        postData('/api/remBook',remed_book[0]);
    }

    articleRemove(list_index) {
        let Articles = this.state.Articles.slice()
        let remed_article= Articles.splice(list_index,1)
        this.setState({
            Articles: Articles
        })

        remed_article[0].User_id = this.props.userID
        postData('/api/remArticle', remed_article[0])
    }

    componentDidMount() {
        postData("/api/getList",{User_id: this.props.userID})
            .then(res => res.json())
            .then((result) => {
                    this.setState({
                        Books: (result.Books !== null) ? result.Books:[],
                        Articles: (result.Articles !== null) ? result.Articles:[]
                    });
                });
    }

    render() {
        const { Books, Articles, newData } = this.state;

        var itemForm;
        if (newData === "book")
            itemForm = <Form onSubmit={this.bookListAdd.bind(this)} type={this.state.newData} />
        else
            itemForm = <Form onSubmit={this.articleAdd.bind(this)} type={this.state.newData} />

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

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userID: '',
        };

        this.statusChangeCallback = this.statusChangeCallback.bind(this);
    }

    statusChangeCallback(login_response) {
        console.log(login_response)
        const user_id = login_response.authResponse.userID
        if (login_response.status === "connected") {
            this.setState({
                userID: user_id,
            });
        }
    }

    checkLoginState() {
        const callback = this.statusChangeCallback
        window.FB.getLoginStatus(function(response) {
            callback(response);
        });
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

    render() {
        const userID = this.state.userID;

        if (userID == '') {
            return <Login onLogin={this.checkLoginState.bind(this)} />
        } else {
            return <Readr userID={userID} />
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

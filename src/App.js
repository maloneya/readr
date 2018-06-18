import React, { Component } from 'react';
import { Button, Dialog, MenuItem } from '@blueprintjs/core';
import { Suggest } from '@blueprintjs/select';
import './index.css';

function Login(props) {
	return (
		<div className="Body">
			<div className="pt-card pt-elevation-3">
				<img src="/assets/logo.png" className="Center" alt="Readr logo"/>
				<div className="Center fb-login-button" data-onlogin={() => props.onLogin} data-scope="public_profile,user_friends" data-width="400" data-size="large" data-button-type="continue_with" data-show-faces="false" data-auto-logout-link="false" data-use-continue-as="true"></div>
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
			<input className="pt-input" placeholder="Search My List..." type="text"
				value={this.props.filterText}
				onChange={this.handleFilterTextChange}
			/>
		);
	}
}

function Navbar(props) {
	return (
		<nav className="pt-navbar">
			<div className="pt-navbar-group pt-align-left">
				<div className="pt-navbar-heading">Readr</div>
				<SearchBar filterText={props.filterText} onFilterTextChange={props.onFilterTextChange}/>
			</div>
			<div className="pt-navbar-group pt-align-right">
				<button className="pt-button pt-minimal pt-icon-home">Home</button>
				<button className="pt-button pt-minimal pt-icon-document">List</button>
				<span className="pt-navbar-divider"></span>
				<button className="pt-button pt-minimal pt-icon-user"></button>
				<button className="pt-button pt-minimal pt-icon-notifications"></button>
				<button className="pt-button pt-minimal pt-icon-cog"></button>
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
		};

		this.share = this.share.bind(this);
		this.toggleDialog = this.toggleDialog.bind(this);
	}

	getFriends() {
		const shareButton = this;
		window.FB.api(
			'/me',
			'GET',
			{'fields':'id,name,friends'},
			function(response) {
				shareButton.setState({
					friends: response.friends.data
				});
			}
		);
	}

	share(friend) {
		let shareItem = {
			UserID: friend.id,
			AddedBy: this.props.userID
		};

		if (this.props.type === 'book') {
			shareItem.Title = this.props.item.Title;
			shareItem.Author = this.props.item.Author;
			postData('/api/addBook', shareItem);
		} else if (this.props.type === 'article') {
			shareItem.URL = this.props.item.URL;
			postData('/api/addArticle', shareItem);
		}

		this.setState({isOpen:false});
	}

	toggleDialog() {this.setState({ isOpen: !this.state.isOpen });}

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
			Title: '',
			Author: '',
			URL: ''
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
		});
	}

	render() {
		let inputs = (this.props.type === 'book') ? 
			(<React.Fragment>
				<td>
					<input placeholder="Title" className="pt-input" name="Title" type="text" value={this.state.Title} onChange={this.handleChange} />
				</td>
				<td>
					<input placeholder="Author" className="pt-input" name="Author" type="text" value={this.state.Author} onChange={this.handleChange} />
				</td>
			</React.Fragment>):(
				<td>
					<input placeholder="URL" className="pt-input" name="URL" type="text" value={this.state.URL} onChange={this.handleChange} />
				</td>
			);
		
		return (
			<table>
				<tbody>
					<tr>
						{inputs}
						<td>
							<div className="pt-button-group">
								<Button name="type" className="pt-button pt-intent-success pt-icon-add" onClick={this.handleSubmit} role="button" />
								<UserContext.Consumer>
									{(UserID) => (<ShareButton type={this.props.type} item={this.state} userID={UserID}/>)}
								</UserContext.Consumer>
							</div>
						</td>
					</tr>
				</tbody>
			</table> 
		);
	}
}

class Book extends Component {
	render() {
		return (
			<tr>
				<td>{this.props.Title}</td>
				<td>{this.props.author}</td>
				<td><button type="button" className="pt-button pt-icon-tick" onClick={this.props.onClick}/></td>
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
					<div className="pt-button-group">
						<Button name="type" className="pt-button pt-icon-tick" onClick={this.props.onClick} role="button" />
						<Button name="type" className="pt-button pt-icon-document-open" onClick={() => window.open(this.props.url)} role="button" />
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
			book.ReqType = 'book';
			books.push(<Book Title={book.Title} author={book.Author} onClick={() => this.props.bookAction(book)}/>);
		});

		this.props.articles.forEach((article,i) => {
			if ((article.Title + article.Publication).toLowerCase().indexOf(filterText) === -1) {
				return;
			}
			article.ReqType = 'article';
			articles.push(<Article Title={article.Title} publication={article.Publication} url={article.URL} onClick={() => this.props.articleAction(article)} />);
		});

		return (
			<table className='pt-html-table'>
				<thead>
					<tr>
						<th>Title</th><th>Author/Publication</th>
					</tr>
				</thead>
				<tbody>
					{books}
					{articles}
				</tbody>
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
		};

		this.handleFilterTextChange = this.handleFilterTextChange.bind(this);
		this.acceptShare = this.acceptShare.bind(this);
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

		book.UserID = this.props.userID;
		book.AddedBy = this.props.userID;
		postData('/api/addBook',book);
	}

	articleAdd(url) {
		let Articles = this.state.Articles.slice();
		let article = {
			URL: url,
			UserID: this.props.userID,
			AddedBy: this.props.userID
		};

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

	bookListRemove(item) {
		let Books = this.state.Books.slice();
		let remed_book = Books.splice(item.id,1);
		this.setState({
			Books: Books
		});

		remed_book[0].UserID = this.props.userID;
		postData('/api/remBook',remed_book[0]);
	}

	articleRemove(item) {
		let Articles = this.state.Articles.slice();
		let remed_article= Articles.splice(item.id,1);
		this.setState({
			Articles: Articles
		});

		remed_article[0].UserID = this.props.userID;
		postData('/api/remArticle', remed_article[0]);
	}

	acceptShare(item) {
		item.UserID = this.props.userID;
		postData('/api/acceptShare', item);
		if (item.ReqType === 'book') {
			let items = this.state.Books.slice();
			items[item.id].AddedBy = this.props.userID;
			this.setState({Books: items});
		} else {
			let items = this.state.Articles.slice();
			items[item.id].AddedBy = this.props.userID;
			this.setState({Articles: items});
		}
	}

	componentDidMount() {
		postData('/api/getList',{UserID: this.props.userID})
			.then(res => res.json())
			.then((result) => {
				this.setState({
					Books: (result.Books !== null) ? result.Books:[],
					Articles: (result.Articles !== null) ? result.Articles:[]
				});
			})
			.catch((error) => {
				console.log(error);
			});
	}

	render() {
		const { Books, Articles, newData } = this.state;
		let myBooks = [], myArticles = [], sharedBooks = [], sharedArticles = [];

		Books.forEach((book,i) => {
			book.id = i;
			if (book.AddedBy === this.props.userID)
				myBooks.push(book);
			else
				sharedBooks.push(book);
		});
		Articles.forEach((article,i) => {
			article.id = i;
			if (article.AddedBy === this.props.userID)
				myArticles.push(article);
			else
				sharedArticles.push(article);
		});

		var shareCard; 
		if (sharedArticles.length + sharedBooks.length > 0) {
			shareCard = (
				<div className="pt-card">
					<div className="pt-callout .modifier">
						<h5 className="pt-callout-title">Shared With Me</h5>
					</div>
					<ReadingList 
						filterText={this.state.filterText} 
						books={sharedBooks}
						articles={sharedArticles}
						bookAction={this.acceptShare.bind(this)}
						articleAction={this.acceptShare.bind(this)}/>
				</div>
			);
		}

		var itemForm;
		if (newData === 'book')
			itemForm = <Form onSubmit={this.bookListAdd.bind(this)} type={this.state.newData} />;
		else
			itemForm = <Form onSubmit={this.articleAdd.bind(this)} type={this.state.newData} />;

		return (
			<div className='Body'>
				<Navbar filterText={this.state.filterText} onFilterTextChange={this.handleFilterTextChange}/>
				<div className="pt-card">
					<div className="pt-callout .modifier">
						<h5 className="pt-callout-title">My List</h5>
					</div>
					<ReadingList 
						filterText={this.state.filterText}
						books={myBooks}
						articles={myArticles}
						bookAction={this.bookListRemove.bind(this)}
						articleAction={this.articleRemove.bind(this)}/>
				</div>
				{shareCard}
				<div className="pt-card">
					<div className="pt-button-group">
						<Button name="type" className="pt-button pt-icon-document" role="button" onClick={() => this.setState({newData:'article'})} />
						<Button name="type" className="pt-button pt-icon-git-repo" role="button" onClick={() => this.setState({newData:'book'})}/>
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
		const user_id = login_response.authResponse.userID;
		if (login_response.status === 'connected') {
			this.setState({
				userID: user_id,
			});
		}
	}

	checkLoginState() {
		const callback = this.statusChangeCallback;
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
			js.src = 'https://connect.facebook.net/en_US/sdk.js';
			fjs.parentNode.insertBefore(js, fjs);
		}(document, 'script', 'facebook-jssdk'));
	}

	render() {
		const userID = this.state.userID;

		if (userID === '') {
			return <Login onLogin={this.checkLoginState.bind(this)} />;
		} else {
			return (
				<UserContext.Provider value={userID}>
					<Readr userID={userID} />
				</UserContext.Provider>
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
	});
}

export const UserContext = React.createContext('');
export default App;

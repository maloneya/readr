import React, { Component } from 'react';
import { Button, Dialog, MenuItem } from '@blueprintjs/core';
import { Suggest } from '@blueprintjs/select';
import './index.css';

function Login(props) {
	return (
		<div className="Body">
			<div className="bp3-card bp3-elevation-3">
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
			<input className="bp3-input" placeholder="Search My List..." type="text"
				value={this.props.filterText}
				onChange={this.handleFilterTextChange}
			/>
		);
	}
}

function Navbar(props) {
	return (
		<nav className="bp3-navbar">
			<div className="bp3-navbar-group bp3-align-left">
				<div className="bp3-navbar-heading">Readr</div>
				<SearchBar filterText={props.filterText} onFilterTextChange={props.onFilterTextChange}/>
			</div>
			<div className="bp3-navbar-group bp3-align-right">
				<button className="bp3-button bp3-minimal bp3-icon-home">Home</button>
				<button className="bp3-button bp3-minimal bp3-icon-document">List</button>
				<span className="bp3-navbar-divider"></span>
				<button className="bp3-button bp3-minimal bp3-icon-user"></button>
				<button className="bp3-button bp3-minimal bp3-icon-notifications"></button>
				<button className="bp3-button bp3-minimal bp3-icon-cog"></button>
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
		// window.FB.api(
		// 	'/me',
		// 	'GET',
		// 	{'fields':'id,name,friends'},
		// 	function(response) {
		// 		shareButton.setState({
		// 			friends: response.friends.data
		// 		});
		// 	}
		// );
	}

	share(friend) {
		let shareItem = {
			UserID: friend.id,
			AddedBy: this.props.userID
		};

		if (this.props.item.ReqType === 'book') {
			shareItem.Title = this.props.item.Title;
			shareItem.Author = this.props.item.Author;
			postData('/api/addBook', shareItem);
		} else if (this.props.item.ReqType === 'article') {
			shareItem.URL = this.props.item.URL;
			postData('/api/addArticle', shareItem);
		}

		this.setState({isOpen:false});
	}

	toggleDialog() {this.setState({ isOpen: !this.state.isOpen });}

	render() {
		return (
			<div>
				<Button onClick={() => {this.toggleDialog();this.getFriends();}} className="bp3-icon-share bp3-intent-primary" />
				<Dialog
					icon="inbox"
					isOpen={this.state.isOpen}
					onClose={this.toggleDialog}
					title="Share With"
				>
					<div className='bp3-dialog-body'>
						<FriendList friends={this.state.friends} onClick={this.share} />
					</div>
					<div className="bp3-dialog-footer">
						<div className="bp3-dialog-footer-actions">
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
			URL: '',
			ReqType: this.props.type //putting this here because we just pass the whole state object to share
		};

		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}
	
	handleChange(event) {
		const target = event.target;
		const value = target.value;
		const name = target.name;

		this.setState({
			[name]: value,
			ReqType: this.props.type
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
					<input placeholder="Title" className="bp3-input" name="Title" type="text" value={this.state.Title} onChange={this.handleChange} />
				</td>
				<td>
					<input placeholder="Author" className="bp3-input" name="Author" type="text" value={this.state.Author} onChange={this.handleChange} />
				</td>
			</React.Fragment>):(
				<td>
					<input placeholder="URL" className="bp3-input" name="URL" type="text" value={this.state.URL} onChange={this.handleChange} />
				</td>
			);
		
		return (
			<table>
				<tbody>
					<tr>
						{inputs}
						<td>
							<Actions CompleteButton={this.handleSubmit} ShareButton={this.state} OpenButton='none'/>
						</td>
					</tr>
				</tbody>
			</table> 
		);
	}
}

function Actions(props) {
	let share = (props.ShareButton !== 'none') ? 
		<UserContext.Consumer>
			{(UserID) => (<ShareButton item={props.ShareButton} userID={UserID}/>)}
		</UserContext.Consumer> : '';

	let complete = (props.CompleteButton !== 'none') ? <Button name="type" className="bp3-button bp3-icon-tick" onClick={props.CompleteButton} role="button" /> : '';

	let open = (props.OpenButton !== 'none') ? 	<Button name="type" className="bp3-button bp3-icon-document-open" onClick={() => window.open(props.OpenButton)} role="button" /> : '';

	return (
		<div className='bp3-button-group'>
			{complete}
			{open}
			{share}
		</div>
	);
}

function ListItem(props) {
	let data = [];
	let i = 0;
	const displayProperties = ['Title','Publication','Author','AddedBy'];
	for (var property in props.item) 
		if (props.item.hasOwnProperty(property) && displayProperties.indexOf(property) >= 0)
			data.push(<td key={i++}>{props.item[property]}</td>);
	
	let open = (props.item.ReqType === 'article') ? props.item.URL : 'none';

	return (
		<tr>
			{data}
			<Actions ShareButton={props.item} CompleteButton={props.onClick} OpenButton={open}/> 
		</tr>
	);
}	


class ReadingList extends Component {
	render() {
		const filterText = this.props.filterText.toLowerCase();
		const books = [];
		const articles = [];

		this.props.books.forEach((book) => {
			let key = book.Title + book.Author;
			if ((key).toLowerCase().indexOf(filterText) === -1) {
				return;
			}
			book.ReqType = 'book';
			books.push(<ListItem key={key} item={book} onClick={() => this.props.bookAction(book)}/>);
		});

		this.props.articles.forEach((article) => {
			let key = article.Title + article.Publication;
			if ((key).toLowerCase().indexOf(filterText) === -1) {
				return;
			}
			article.ReqType = 'article';
			articles.push(<ListItem key={key} item={article} onClick={() => this.props.articleAction(article)}/>);
		});

		return (
			<table className='bp3-html-table'>
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
		// postData('/api/getList',{UserID: this.props.userID})
		// 	.then(res => res.json())
		// 	.then((result) => {
		// 		this.setState({
		// 			Books: (result.Books !== null) ? result.Books:[],
		// 			Articles: (result.Articles !== null) ? result.Articles:[]
		// 		});
		// 	})
		// 	.catch((error) => {
		// 		console.log(error);
		// 	});
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
				<div className="bp3-card">
					<div className="bp3-callout .modifier">
						<h5 className="bp3-callout-title">Shared With Me</h5>
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
				<div className="bp3-card">
					<div className="bp3-callout .modifier">
						<h5 className="bp3-callout-title">My List</h5>
					</div>
					<ReadingList 
						filterText={this.state.filterText}
						books={myBooks}
						articles={myArticles}
						bookAction={this.bookListRemove.bind(this)}
						articleAction={this.articleRemove.bind(this)}/>
				</div>
				{shareCard}
				<div className="bp3-card">
					<div className="bp3-button-group">
						<Button name="type" className="bp3-button bp3-icon-document" role="button" onClick={() => this.setState({newData:'article'})} />
						<Button name="type" className="bp3-button bp3-icon-git-repo" role="button" onClick={() => this.setState({newData:'book'})}/>
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
		//const user_id = login_response.authResponse.userID;
		const user_id = 0;
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
		//const userID = this.state.userID;
		const userID = 0;

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

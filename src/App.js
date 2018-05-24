import React, { Component } from 'react';

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

class ItemForm extends Component {
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
                    <input class="pt-input" name="Title" type="text" value={this.state.Title} onChange={this.handleChange} />
                </td>
                <td>
                    <input class="pt-input" name="Author" type="text" value={this.state.Author} onChange={this.handleChange} />
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

class ReadingList extends Component {
    render() {
        const filterText = this.props.filterText.toLowerCase();
        const listItems = [];

        this.props.books.forEach((book,i) => {
            if ((book.Title + book.Author).toLowerCase().indexOf(filterText) === -1) {
                return;
            }
            listItems.push(<Book Title={book.Title} author={book.Author} onClick={() => this.props.readingListRemove(i)}/>);
        });

        return (
            <table class='pt-html-table pt-html-table-striped'>
                <thead>
                    <tr>
                        <th>Title</th><th>Author</th>
                    </tr>
                </thead>
                {listItems}
                <ItemForm onSubmit={this.props.readingListAdd} />
            </table>
        );
    }
}

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            error: null,
            isLoaded: false,
            readingList: null,
            filterText: ''
        };

        this.handleFilterTextChange = this.handleFilterTextChange.bind(this);
    }

    handleFilterTextChange(filterText) {
        this.setState({
            filterText: filterText
        });
    }

    readingListAdd(book) {
        let readingList = this.state.readingList.slice();
        readingList.push(book);
        this.setState({
            readingList: readingList
        });

        postData('/api/addBook',book);
    }

    readingListRemove(list_index) {
        let readingList = this.state.readingList.slice()
        readingList.splice(list_index,1);
        this.setState({
            readingList: readingList
        });
        let data = {
            List_id: list_index
        }

        postData('/api/remBook',data);
    }

    componentDidMount() {
        fetch("/api/getList")
            .then(res => res.json())
            .then(
                (result) => {
                    this.setState({
                        isLoaded: true,
                        readingList: (result.Books !== null) ? result.Books:[]
                    });
                },
                (error) => {
                    this.setState({
                        isLoaded: true,
                        error
                    });
                }
            )
    }

    render() {
        const { error, isLoaded, readingList } = this.state;
        if (error) {
            return <div>Error: {error.message}</div>;
        } else if (!isLoaded) {
            return <div>Loading ... </div>;
        } else {
            return (
                <div class='body'>
                    <Navbar filterText={this.state.filterText} onFilterTextChange={this.handleFilterTextChange}/>
                    <div class="pt-card">
                        <ReadingList filterText={this.state.filterText} books={this.state.readingList}
                        readingListRemove={this.readingListRemove.bind(this)}
                        readingListAdd={this.readingListAdd.bind(this)}/>
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

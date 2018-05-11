import React, { Component } from 'react';

function Navbar() {
    return (
        <nav class="pt-navbar">
            <div class="pt-navbar-group pt-align-left">
                <div class="pt-navbar-heading">Readr</div>
                <input class="pt-input" placeholder="Search Books..." type="text" />
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
        this.setState({
            Title: event.target.Title,
            Author: event.target.Author
        });
    }

    handleSubmit(event) {
        alert("New Book added!")
        event.preventDefault();
    }

    render() {
        return (
            <form onSubmit={this.handleSubmit}>
                <label class="pt-label">
                    Title:
                    <input class="pt-input" type="text" value={this.state.Title} onChange={this.handleChange} />
                </label>
                <label class="pt-label">
                    Author:
                    <input class="pt-input" type="text" value={this.state.Author} onChange={this.handleChange} />
                </label>
                <input class="pt-button pt-intent-success" type="submit" value="Submit" />
            </form>
        );
    }
}

class ReadItem extends Component {
    render() {
        return (
            <tr>
                <td>{this.props.Title}</td>
                <td>{this.props.author}</td>
                <td><button type="button" class="pt-button pt-icon-add">Done</button></td>
            </tr>
        );
    }
}

class ReadList extends Component {
    render() {
        const listItems = this.props.books.map((book) =>
            <ReadItem Title={book.Title} author={book.Author} />
        );

        return (
            <table class='pt-html-table pt-html-table-striped'>
                {listItems}
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
            data: null
        };
    }

    componentDidMount() {
        fetch("/api/test")
            .then(res => res.json())
            .then(
                (result) => {
                    this.setState({
                        isLoaded: true,
                        data: result.Books
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
        const { error, isLoaded, data } = this.state;
        if (error) {
            return <div>Error: {error.message}</div>;
        } else if (!isLoaded) {
            return <div>Loading ... </div>;
        } else {
            return (
                <div class='body'>
                    <Navbar />
                    <div class="pt-card">
                        <ReadList books={this.state.data}/>
                    </div>
                    <div class="pt-card">
                        <ItemForm />
                    </div>
                </div>
            );
        }
    }
}

export default App;

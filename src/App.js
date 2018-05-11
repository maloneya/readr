import React, { Component } from 'react';

class ReadItem extends Component {
    render() {
        return (
            <tr>
                <td>{this.props.name}</td>
                <td>{this.props.author}</td>
                <td><button type="button" class="pt-button pt-icon-add">Add to List</button></td>
            </tr>
        );
    }
}

class ReadList extends Component {
    render() {
        const listItems = this.props.books.map((book) =>
            <ReadItem name={book.name} author={book.Author} />
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
                <div>
                    <ReadList books={this.state.data}/>
                </div>
            );
        }
    }
}

export default App;

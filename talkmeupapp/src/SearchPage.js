import React from 'react';

class SearchPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {term: ""};

        this.handleChange = event => {
            this.setState({term: event.target.value});
            event.preventDefault();
        }

        this.onSubmit = event => {
            if (this.state.term.length > 0) {
                this.props.searchForTerm(this.state.term);
            }
            event.preventDefault(); // prevent refresh of the page
        }
    }

    render() {
        return (
            <form onSubmit={this.onSubmit} className="SearchPage">
                <table className="SearchPageTable"><tbody><tr>
                    <td className="SearchBarCell"><input
                        className="SearchBar" 
                        type='text'
                        value={this.state.term}
                        placeholder='Search for something!'
                        onChange={this.handleChange}
                    /></td>
                    <td className="SearchButtonCell"><input className="SearchButton" type='submit' value='Search!'/></td>
                </tr></tbody></table>
            </form>
        );
    }
}

export default SearchPage;
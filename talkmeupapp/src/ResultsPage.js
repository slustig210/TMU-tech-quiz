import React from 'react';

function Result(props) {
    let media = null;
    switch (props.type) {
        default:
            console.error("Unkown result type: " + props.type);
            break;
        case 'image':
            media = <img className="ResultMedia" src={props.src} alt={"An image relating to " + props.searchedTerm}
                /*onClick={() => props.setInterest(!props.interest)}*/ />;
            break;
        case 'video':
            media = <div className="ResultMedia" dangerouslySetInnerHTML={{__html: props.player}}/>; // embed from youtube
            break;
    }

    return (
        <div className="Result">
            <div>
                {media}
            </div>
            <input
                type='button'
                value={props.interest ? "Interested!" : "Not Interested"}
                onClick={(event) => {props.setInterest(!props.interest); event.preventDefault()}}
                style={props.interest ? {color:"green"} : {color:"red"}}/>
        </div>
    );
}

class ResultsPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {results: this.props.results.slice()};
        this.state.results.sort(() => Math.random() - 5); // sorts randomly

        this.getSetInterest = (index) => {
            return (interest) => {
                const results = this.state.results.slice();
                results[index] = Object.assign({}, results[index]);
                results[index].interest = interest;
                this.setState({results: results});
                console.log("Setting interest of " + results[index].src + " to " + interest);
            }
        }

        this.goBack = this.goBack.bind(this);
    }

    goBack() {
        this.props.setInterests(this.props.searchedTerm, this.state.results.filter(result => result.interest).map(result => result.src));
        this.props.goBack();
    }

    // this is needed because the google and youtube results
    // come in at different times so
    // this is called when a new batch of results comes back
    // from google, and it updates this.state.results
    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.results !== prevProps.results) {
            // props results was updated
            // copy over the values + shuffle.
            const results = this.props.results.slice();
            results.sort(() => Math.random() - 0.5);
            this.setState({results: results});
        }
    }

    render() {
        // added later so it is a little out of place, but it works here
        // ideally would change this to happen in constructor and componentDidUpdate
        const copy = this.state.results.slice();
        const results2D = [];
        while(copy.length) results2D.push(copy.splice(0,3));

        return (
            <div className="ResultsPage">
                <table className="ResultsMatrix"><tbody>
                    {results2D.map((row, rowIndex) =>
                        <tr className="ResultsRow" key={rowIndex}>
                            {row.map((result, colIndex) => <td className="ResultsCell" key={rowIndex * 3 + colIndex}><Result
                                searchedTerm={this.props.searchedTerm}
                                src={result.src}
                                type={result.type}
                                interest={result.interest}
                                player={result.player} // undefined for image, embedHtml for video.
                                setInterest={this.getSetInterest(rowIndex * 3 + colIndex)}
                            /></td>)}
                        </tr>
                    )}
                </tbody></table>
                <input className='GoBackButton' type='button' value='Go Back' onClick={this.goBack}/>
            </div>
        );
    }
}

export default ResultsPage;
import './App.css';
import React from 'react';
import SearchPage from './SearchPage.js'
import ResultsPage from './ResultsPage.js'

const GOOGLE_API_KEY = 'AIzaSyAM0zBXsd42sz2F_EcHnQMfr09CJ0pirlY' // would make this an env var in a bigger project
const YOUTUBE_API_KEY = 'AIzaSyAee85G7oYuStRYoBOlgvpp_ky0MKgbqYQ' // ^
const GOOGLE_CX = 'c55eb86d669bd3886' // would make this an env var in a bigger project

class App extends React.Component {
  constructor(props) {
    super(props);

    // interests is an object with key=searched term and
    // value=links that the user said they were interested in
    this.state = {curPage: 'search', interests: {}, searchedTerm: "", results: []};

    this.searchForTerm = this.searchForTerm.bind(this);
    this.setInterests = this.setInterests.bind(this);
  }

  searchForTerm(term) {
    this.setState({curPage: 'results', searchedTerm: term});

    // results properties:
    // src: link to the image/video
    // type: "image" or "video"
    // interest: bool
    console.log("Searching for " + term);

    // search for term
    // for some reason the google API uses http2
    // and that is not usable by an app created by create-react-app,
    // so i will handle the http request directly (sad)
    // the same problem happens with youtube
    const req = new XMLHttpRequest();
    // search for 7 images relating to term on cx, a custom search engine
    // rn get 10 images, then filter for 'valid' images later on and cut off the end
    req.open("GET", "https://customsearch.googleapis.com/customsearch/v1?key=" + GOOGLE_API_KEY +
        "&cx=" + GOOGLE_CX + "&q=" + term + "&num=10&searchType=IMAGE");
    
    req.onreadystatechange = () => {
      if (req.readyState === XMLHttpRequest.DONE) {
        const json = JSON.parse(req.responseText);

        console.log("image results:", json);

        // valid input is kind of assumed
        if (json["error"] === undefined) {
          // only count good results
          const results = json.items.filter(result => result.fileFormat !== "image/").map(result => { return {src: result.link, type: "image"} });
          results.splice(7);

          const linksWithInterest = this.state.interests[term];
          if (linksWithInterest !== undefined) {
            results.forEach(result => result.interest = linksWithInterest.includes(result.src));
          }

          this.setState({results: this.state.results.concat(results)});
        } else {
          console.error("unable to search google images for " + term);
          console.error(req.responseText);
        }
      }
    }

    const req2 = new XMLHttpRequest();
    // search for the 2 videos on youtube
    req2.open("GET", "https://www.googleapis.com/youtube/v3/search?key=" + YOUTUBE_API_KEY +
        "&type=video&videoEmbeddable=true&maxResults=2&q=" + term);

    req2.onreadystatechange = () => {
      if (req2.readyState === XMLHttpRequest.DONE) {
        const json = JSON.parse(req2.responseText);
        if (json["kind"] === "youtube#searchListResponse") {
          
          // get the 2 videos on youtube
          const req3 = new XMLHttpRequest();
          const url = "https://www.googleapis.com/youtube/v3/videos?key=" + YOUTUBE_API_KEY + "&part=player,id&id=" + json.items.map(item => item.id.videoId).join();
          console.log("Getting from " + url);
          req3.open("GET", url);
              
          req3.onreadystatechange = () => {
            if (req3.readyState === XMLHttpRequest.DONE) {
              const json = JSON.parse(req3.responseText);
              if (json["kind"] === "youtube#videoListResponse") {
                console.log("Video results: ", json);
                const results = json.items.map((result) => ({src: "https://youtu.be/" + result.id, player: result.player.embedHtml, type: "video" }));

                const linksWithInterest = this.state.interests[term];
                if (linksWithInterest !== undefined) {
                  results.forEach(result => result.interest = linksWithInterest.includes(result.src));
                }
                this.setState({results: this.state.results.concat(results)});
              } else {
                console.error("Unable to retrieve youtube videos: ", req3.responseText);
              }
            }
          }
          req3.send();
        } else {
          console.error("Unable to search youtube: ", req2.responseText);
        }
      }
    }
    req.send();
    req2.send();
  }

  // links are the links with interest
  setInterests(term, links) {
    const interests = Object.assign({}, this.state.interests);
    if (links.length > 0) {
      interests[term] = links;
    } else if (interests[term] !== undefined) {
      delete interests[term];
    }
    this.setState({interests: interests});
  }

  render() {
    switch(this.state.curPage) {
      default:
        console.error('Unknown page ' + this.state.curPage);
        this.setState({curPage: 'search'});
        // falls through
      case 'search':
        return (
          <div>
            <SearchPage searchForTerm={this.searchForTerm}/>
            <input className="InterestsButton" type='button' value='Get Interests (JSON)' onClick={() => this.setState({curPage: 'interests'})}/>
          </div>
        );
      case 'results':
        return (
          <div>
            <ResultsPage
              searchedTerm={this.state.searchedTerm}
              results={this.state.results}
              setInterests={this.setInterests}
              goBack={() => this.setState({curPage: 'search', results: []})}
            />
          </div>
        );
      case 'interests':
        return (
          <div>
            <div>
              <code>{JSON.stringify(this.state.interests)}</code>
            </div>
            <input className="GoBackButton" type='button' value='Go Back' onClick={() => this.setState({curPage: 'search'})}/>
          </div>
        );
    }
  }
}

export default App;
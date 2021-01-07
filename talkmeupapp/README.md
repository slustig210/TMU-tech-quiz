# Talk Me Up Search App
note -- the consumer and producer program was short and I had a lot of comments so I did not write any README for that.

## index.html

In the index.html, there is a header which shows throughout all of the different 'pages' in the app. It says 'TalkMeUp Tech Quiz - Image/Video Search App'
Then it has a div tag which shows the App component from App.js

## App.js

The App component stores the state of the App and manages what current 'page' the user can see. The App starts with this.state.curPage='search', or starts on the search page. Interests represents links marked as interesting by the user on the 'results' page. searchedTerm is a variable which is passed from the searchPage into the resultsPage. Results is the current batch of results from a query (explained more in the section on searchForTerm).

The App component also has a method for setting the interest of certain links. If the links array (array of string representations of links) is not empty, the function sets interests\[term\] to links. Else, it deletes interests\[term\].

## SearchPage.js

The search page contains a search bar and a search button in a form. On submit, the search page calls searchForTerm on the query written in the search bar. This function is passed down to the searchPage from the App component as a property. If the search bar is not empty, the searchForTerm function searches and changes the page to the results page. I will go into more detail about searchForTerm in the ResultsPage.js section.

## ResultsPage.js

After searchForTerm is called, the page is changed to 'results' and the ResultsPage is displayed on render. The ResultsPage component is passed a results array, which contain objects in the form {src: link to image or video, type: 'image' | 'video', interest: bool, player: youtube's HTML embed | undefined for images}.

The interest booleans are passed in during the constructor of ResultsPage, and whenever new results are passed in in ResultsPage.componentDidUpdate. The interests are set in ResultsPage.goBack, when the function goes back to the search page. In this way, the ResultsPage can keep a state of the interests for each result, but only update the App's state 1 time.

I simply display the results in a table and have a function for displaying results, called Result, defined above the ResultsPage class.

### searchForTerm(term)

The search method of the App component in App.js is crucial to the function of this application. It takes in a term and, if the term is not empty, switches the page to the results page, and sends HTTP requests to google (for images) and youtube (for videos).

Because of an issue with create-react-app and http2, I was unable to get the google APIs working for this project, so I handled HTTP requests directly. This was not a big issue because the google APIs are extremely well-documented.

Note: Results should be initially set to an empty array (when page is switched to search page) for this to work properly, because the searches concatenate their results to the end of the results array and the HTTP request are asynchronous.

#### Google Image Searches

For google image searches, I made a custom search engine on the google custom search engine websites, and I have an API key as well as the search engine identifier (cx).

I ask the google API for 10 images because occasionally there are images that cannot be shown with the html img tag. These usually are marked with fileFormat = 'image/' so I filter out those images and take the first 7 of the remaining image results. Then I mark them based on interest and add the results to this.state.results.

Occasionally there will be a set of images with less than 7 valid links, but in my testing I did not find any. If I were to redo this I would either find a way to show these weird image links as images, as google must have, or I would continuously poll until I had 7 valid images with fileFormats.

#### Youtube Searches

For youtube searches, first we must search youtube for 2 embeddable videos relating to the query. I have a youtube api key from google's API website. Then, when the search comes back, we must get information about these videos, so we make another HTTP request to youtube asking for this info, passing in the video IDs from the search query. Then, finally, we map the video results to the result type defined above and send it to the ResultsPage. I have run into no problems displaying the youtube results because I searched youtube using videoEmbeddable=true.

## Get Interests

After the SearchPage component, on the 'search' page is a button that says 'Get Interests (JSON).' I was not sure what the email prompted for getting the interests, but it did specify that it had to be in JSON form. So, I made this button change the state.curPage variable to 'interests', which displays the JSON of this.state.interests and has a button to go to the search page. The interests page does not have a component associated with it because it is so simple.

# Running the web app

With npm installed I simply type npm start into a console and it opens the web app.

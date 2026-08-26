# Kitsu Cove Movie & Series Catalogue

Kitsu Cove is a beginner-friendly front-end school project. It looks like a small streaming catalogue and demonstrates how HTML, CSS, JavaScript, JSON, local images, and a public API work together.

The app is intentionally built with plain HTML, CSS, and JavaScript. There is no framework, database, build tool, or secret API key to configure.

## What this project teaches

The real purpose is not to stream video. It is to practise these front-end skills:

1. Building a responsive interface from a visual reference.
2. Storing related information as JavaScript/JSON objects.
3. Reusing one card design for many movies and series.
4. Listening for clicks and form submissions.
5. Requesting information from an external API with `fetch()`.
6. Updating the page with returned information.
7. Handling an error when the network or API is unavailable.

## Main features

- Responsive desktop and mobile layouts
- Local hero, poster, and logo images
- Movie and series filter buttons
- Real series search using the TVMaze API
- Hardcoded local catalogue when the page first loads
- Local search fallback if an API request fails
- Bookmark, theme, and horizontal-scroll buttons
- Local Font Awesome icons

## Project files

```text
Movie-Api/
|-- index.html       Page structure and content
|-- style.css        Colours, layout, cards, and responsive rules
|-- app.js           Data loading, API request, filtering, and interactions
|-- data.Json        Starting hardcoded movie/series data
|-- server.js        Tiny local development server
|-- package.json     Provides the npm start command
|-- images/          Every image displayed by the app
|-- fontawesome-.../ Local icon library
`-- README.md        This guide
```

## How to run it

Do not double-click `index.html`. The app uses `fetch()` to read `data.Json`, and browsers normally block that request when a page is opened as a `file://` address. Start a small development server instead.

In PowerShell, move into the project folder:

```powershell
cd C:\Users\uhufe\Movie-Api
```

Start the included server:

```powershell
npm start
```

Visit:

```text
http://localhost:8000
```

Stop the server by returning to PowerShell and pressing `Ctrl + C`. The server uses only Node.js built-in features, so there is no `npm install` step and no dependency folder.

If port 8000 is already busy, use another port:

```powershell
node server.js 8080
```

Then visit `http://localhost:8080`.

VS Code's Live Server extension is another option: right-click `index.html` and choose **Open with Live Server**. If you have Python instead of Node.js, `python -m http.server 8000` also works.

## How the page loads

```text
Browser opens index.html
        |
        +--> style.css styles the HTML
        +--> Font Awesome supplies the icons
        `--> app.js runs loadLocalCatalogue()
                    |
                    `--> fetch("data.Json")
                              |
                              `--> renderShows() creates the cards
```

`index.html` contains an empty card container:

```html
<div class="show-grid" id="show-grid"></div>
```

JavaScript reads the array in `data.Json`, turns every object into a card, and places those cards inside the container. This is better than copying the same card HTML eight times because one template controls every card.

## Understanding the local data

One object in `data.Json` looks like this:

```json
{
  "id": 1,
  "title": "Jujutsu Legacy",
  "type": "Series",
  "score": 8.7,
  "episodes": 24,
  "year": 2023,
  "genres": ["Action", "Fantasy"],
  "image": "images/jjk.jpg"
}
```

- `id` uniquely identifies the title.
- `title` is displayed as the card heading.
- `type` must be `Movie` or `Series` so the filters work.
- `score` is displayed beside the star icon.
- `episodes` is used for series. Movies display `Film` instead.
- `year` is the release year.
- `genres` is an array because a title can have several genres.
- `image` points to a file in the local `images` folder.

To add a title, copy one object, put a comma between it and the previous object, and change its values. JSON does not allow a trailing comma after the final object.

## The API used by this project

Search uses the public [TVMaze API](https://www.tvmaze.com/api). TVMaze returns television-series information as JSON, supports browser requests through CORS, and does not require an API key for this search. The local catalogue demonstrates both movies and series; the online search demonstrates series data.

The request URL has this form:

```text
https://api.tvmaze.com/search/shows?q=naruto
```

The parts mean:

- `https://api.tvmaze.com/search/shows` is the endpoint (API address).
- `?` begins the query parameters.
- `q=naruto` is the title to search for.

Paste that URL into a browser to see the returned JSON. An API returns data; our HTML, CSS, and JavaScript decide how that data looks.

## The API call, line by line

The important code is in `searchShows()` in `app.js`:

```javascript
const apiUrl = `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query)}`;
const response = await fetch(apiUrl);

if (!response.ok) {
  throw new Error(`The API returned status ${response.status}.`);
}

const result = await response.json();
```

1. `apiUrl` builds the address using the visitor's search text.
2. `encodeURIComponent(query)` makes spaces and special characters safe in a URL.
3. `fetch(apiUrl)` sends an HTTP `GET` request.
4. `await` pauses this function until the request finishes; it does not freeze the page.
5. `response.ok` tells us whether the server returned a successful status.
6. `response.json()` converts JSON into a JavaScript object.
7. TVMaze returns an array. Each result has matching information inside its `show` property.

The function is declared with `async` because it uses `await`.

## Why the API results are mapped

TVMaze's fields do not exactly match our local fields. Its title is called `name`, for example. `slice(0, 8)` keeps the first eight results, and `map()` converts each API item to the shape expected by `createShowCard()`:

```javascript
state.shows = result.slice(0, 8).map((item, index) => ({
  id: item.show.id,
  title: item.show.name,
  type: "Series",
  score: item.show.rating.average || "N/A",
  status: item.show.status,
  year: item.show.premiered ? item.show.premiered.slice(0, 4) : null,
  genres: item.show.genres,
  image: localPosters[index % localPosters.length],
}));
```

The final `image` line matters for this assignment. TVMaze supplies online image URLs, but we ignore them and pair every result with a file from the repo's `images` folder.

The `%` (remainder) operator cycles back to the first local poster if there are more results than pictures.

## What happens if the API fails?

Network requests can fail. The API may be unavailable, the user may lose internet access, or the public service may temporarily limit requests. The request is inside `try...catch`:

```javascript
try {
  // Try the online request.
} catch (error) {
  // Search the original local catalogue instead.
}
```

This is graceful error handling: the visitor gets a useful fallback instead of a broken page. The error is also printed in the browser console with `console.error(error)`. Open developer tools with `F12` and select **Console** to inspect it.

## How filtering works

The `state` object stores the available shows and current filter:

```javascript
const state = {
  shows: [],
  originalShows: [],
  activeFilter: "All",
};
```

When a filter is clicked, `setActiveFilter()` changes `activeFilter`. `applyCurrentFilter()` keeps only matching objects and calls `renderShows()` again. The original catalogue is kept separately so an empty search can restore it.

## How bookmarks work

API cards do not exist during the initial page load. One click listener is therefore placed on their parent grid:

```javascript
showGrid.addEventListener("click", (event) => {
  const saveButton = event.target.closest(".save-button");
  if (!saveButton) return;
});
```

A click travels (or "bubbles") from a button to the grid. This is called event delegation. Bookmarks are visual only; refreshing clears them because there is no database or `localStorage` yet.

## Responsive design

Media queries alter the layout for smaller screens:

```css
@media (max-width: 620px) {
  .show-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
```

On mobile, desktop links are hidden, the cards use two columns, and a fixed bottom navigation appears. At 390 pixels or less, the grid becomes one column.

## Easy changes to practise

Change the purple colour in `style.css`:

```css
:root {
  --accent: #8b5cf6;
}
```

Change the result count in `app.js` by editing `slice(0, 8)`.

Add another local poster to `localPosters`:

```javascript
"images/your-image.jpg"
```

The path, spaces, capital letters, and file extension must match the real filename.

## Common beginner problems

### The cards do not appear

Use the local server and open `http://localhost:8000`, not a `file://` address. Also check that `data.Json` contains valid JSON.

### An image is broken

Check its path and filename. `image.jpg` and `Image.jpg` may be different names on a web server.

### Search displays local results

The API request probably failed. Check the internet connection and browser console. Wait briefly before searching again because public APIs may limit frequent requests.

### Changes do not show

Save the file and refresh. A hard refresh is `Ctrl + F5` on Windows.

## Useful presentation terms

- **UI:** Everything the visitor sees and interacts with.
- **API:** A service that lets one program request data from another.
- **Endpoint:** An API URL used for one kind of data.
- **JSON:** A text format for structured data.
- **HTTP GET:** A request asking a server to send information.
- **DOM:** The browser's JavaScript representation of the HTML page.
- **Event listener:** Code that waits for an action such as a click.
- **Responsive design:** A layout that adapts to different screen sizes.
- **Fallback:** Backup behaviour used when the preferred action fails.

## Sensible next steps

Once you understand this version, try these one at a time:

1. Store bookmarks in `localStorage` so they survive refreshes.
2. Open a details modal when a card is clicked.
3. Show loading skeletons during an API request.
4. Add pagination for more search results.
5. Replace demo titles with your own selected catalogue.

The current version is deliberately small enough to understand and explain confidently in a school presentation.

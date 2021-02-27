// HTML DOM elements
const appContainer = document.querySelector('.app-container');
const genreDOM = document.querySelector('.genre-container');
const playlistDOM = document.querySelector('.playlist-container');
const tracklistDOM = document.querySelector('.track-container');
const playerDOM = document.querySelector('.player-container');

// Controls all API functionality
class APIController {
    // fetch token
    static async getToken() {
        const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';
        const clientId = '5829ebebc11e4ff098a801a50a65f20c';
        const secretId = 'ba473f3cc1464d42b013990849e70a8a';

        const response = await fetch(TOKEN_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type' : 'application/x-www-form-urlencoded',
                'Authorization' : 'Basic ' + btoa(`${clientId}:${secretId}`),
            },
            body: 'grant_type=client_credentials',
        })
        const data = await response.json();
        return data.access_token;
    }
    // fetch genres
    static async getGenres(token) {
        const GENRE_ENDPOINT = 'https://api.spotify.com/v1/browse/categories?locale=sv_CA';
        const result = await fetch(GENRE_ENDPOINT, {
            method: 'GET',
            headers: {
                'Content-Type' : 'application/x-www-form-urlencoded',
                'Authorization' : 'Bearer ' + token,
            },
        })
        const data = await result.json();
        return data.categories.items;
    }
    // fetch playlist
    static async getPlaylistByGenre(id, token) {
        
        const PBG_ENDPOINT = `https://api.spotify.com/v1/browse/categories/${id}/playlists`
        const result = await fetch(PBG_ENDPOINT, {
            method: 'GET',
            headers: {
                'Content-Type' : 'application/x-www-form-urlencoded',
                'Authorization' : 'Bearer ' + token,
            }
        });
        const data = await result.json()
        return data;
    }
    // fetch tracks
    static async getTracks(token, trackEndpoint) {
        const result = await fetch(trackEndpoint, {
            method: 'GET',
            headers: {
                'Content-Type' : 'application/x-www-form-urlencoded',
                'Authorization' : 'Bearer ' + token,
            }
        });
        const data = await result.json();
        return data.items;
    }
    // fetch track detail
    static async getTrackDetail(id, token) {
        const TRC_ENDPOINT = `https://api.spotify.com/v1/tracks/${id}`
        const result = await fetch(TRC_ENDPOINT, {
            method: 'GET',
            headers: {
                'Content-Type' : 'application/x-www-form-urlencoded',
                'Authorization' : 'Bearer ' + token,
            }
        });
        const data = await result.json();
        return data;
    }
}

// Controls all App functionality
class APPController {
    static setUp() {
        this.loadGenre();
        // add click event listener to genre container
        genreDOM.addEventListener('click', async (e) => {
            if(e.target.localName === 'img') {
                const token = StorageController.getStoredToken();
                const categoryId = e.target.alt;
                const data = await APIController.getPlaylistByGenre(categoryId, token);
                const playlist = data.playlists.items;
                UIController.clearDOM(genreDOM);
                UIController.hideContainer(genreDOM);
                playlist.forEach( (playlist) => UIController.createPlaylist(playlist));
            }
        });
        // add click event listener to playlist container
        playlistDOM.addEventListener('click', async (e) => {
            if(e.target.localName === 'img') {
                const token = StorageController.getStoredToken();
                const trackEndpoint = e.target.dataset.track;
                const data = await APIController.getTracks(token, trackEndpoint);
                UIController.clearDOM(playlistDOM);
                UIController.hideContainer(playlistDOM);
                data.forEach( (track) => UIController.createTrack(track.track));
            }
        });
        // add click event listener to tracklist container
        tracklistDOM.addEventListener('click', async (e) => {
            if(e.target.localName === 'img') {
                const token = StorageController.getStoredToken();
                const uriFull = e.target.dataset.uri;
                const uri = uriFull.slice(8).replace(':', '/');
                const id = e.target.dataset.uri.slice(14);
                const data = await APIController.getTrackDetail(id, token);
                UIController.clearDOM(tracklistDOM);
                UIController.hideContainer(tracklistDOM);
                UIController.createPlayer(uri, data);
            }
        });
    }
    // load genre
    static async loadGenre() {
        const token = await APIController.getToken();
        StorageController.saveToken(token);
        const genres = await APIController.getGenres(token);
        genres.forEach( (genre) => UIController.createGenre(genre));
    }
    // scroll to top function
    static scrollTo() {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth'
        })
    }
}

// Controlls all UI
class UIController {
    // creates genre item
    static createGenre(genre) {
        const genreIcon = genre.icons[0].url;
        const html =
        `
        <div class="genre-item">
            <div class="img-container">
                <img src="${genreIcon}" alt="${genre.id}">
            </div>
            <div class="info">
                <h3>${genre.name}</h3>
            </div>
        </div>
        `
        genreDOM.insertAdjacentHTML('beforeend', html);
        APPController.scrollTo();
    }
    // creates playlist item
    static createPlaylist(playlist) {
        const playlistEndpoint = playlist.tracks.href;
        const playlistIcon = playlist.images[0].url;
        const html =
        `
        <div class="playlist-item">
            <div class="img-container">
                <img src="${playlistIcon}" alt="${playlist.name}" data-track="${playlistEndpoint}">
            </div>
            <div class="playlist-info">
                <h3>${playlist.name}</h3>
            </div>
        </div>
        `
        playlistDOM.insertAdjacentHTML('beforeend', html);
        APPController.scrollTo();
    }
    // creates track item
    static createTrack(track) {
        const image = track.album.images[0].url;
        const html =
        `
        <div class="tracklist-item">
            <div class="img-container">
                <img src="${image}" alt="${track.name}" data-uri="${track.uri}">
            </div>
            <div class="track-info">
                <h3>${track.name}</h3>
            </div>
        </div>
        `
        tracklistDOM.insertAdjacentHTML('beforeend', html);
        APPController.scrollTo();
    }
    // creates spotify widget
    static createPlayer(uri, data) {
        const image = data.album.images[0].url
        const widget =
        `
        <button id="back"><a href="https://ianbrdeguzman.github.io/spotify-app/">back</a></button>
        <button id="github"><a href="https://github.com/ianbrdeguzman/spotify-app">github</a></button>
        <div class="img-container">
            <img src="${image}" alt="${data.name}">
        </div>
        <iframe src="https://open.spotify.com/embed/${uri}" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>
        `
        
        playerDOM.insertAdjacentHTML('beforeend', widget);
        document.body.style.overflow = 'hidden';
        APPController.scrollTo();
    }
    // clears container
    static clearDOM(container) {
        while (container.childNodes.length > 0) {
            container.removeChild(container.childNodes[0]);
        }
    }

    static hideContainer(container) {
        container.style.display = 'none';
    }
}

// Controll Storage
class StorageController {
    // stores token in local storage
    static saveToken(token) {
        localStorage.setItem('token', token)
    }
    // gets token from local storage
    static getStoredToken() {
        return localStorage.getItem('token');
    }
}

// start app
APPController.setUp();

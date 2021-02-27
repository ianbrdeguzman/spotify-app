const appContainer = document.querySelector('.app-container');
const genreDOM = document.querySelector('.genre-container');
const playlistDOM = document.querySelector('.playlist-container');
const tracklistDOM = document.querySelector('.track-container');
const playerDOM = document.querySelector('.player-container');

class APIController {
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

    static async getGenres(token) {
        const GENRE_ENDPOINT = 'https://api.spotify.com/v1/browse/categories?locale=sv_US';
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

class APPController {
    static setUp() {
        this.loadGenre();

        genreDOM.addEventListener('click', async (e) => {
            if(e.target.localName === 'img') {
                const token = StorageController.getStoredToken();
                const categoryId = e.target.alt;
                const data = await APIController.getPlaylistByGenre(categoryId, token);
                const playlist = data.playlists.items;
                UIController.clearDOM(genreDOM);
                playlist.forEach( (playlist) => UIController.createPlaylist(playlist));
            }
        });

        playlistDOM.addEventListener('click', async (e) => {
            if(e.target.localName === 'img') {
                const token = StorageController.getStoredToken();
                const trackEndpoint = e.target.dataset.track;
                const data = await APIController.getTracks(token, trackEndpoint);
                UIController.clearDOM(playlistDOM);
                data.forEach( (track) => UIController.createTrack(track.track));
            }
        });

        tracklistDOM.addEventListener('click', async (e) => {
            if(e.target.localName === 'img') {
                const token = StorageController.getStoredToken();
                const uriFull = e.target.dataset.uri;
                const uri = uriFull.slice(8).replace(':', '/');
                const id = e.target.dataset.uri.slice(14);
                const data = await APIController.getTrackDetail(id, token);
                UIController.clearDOM(tracklistDOM);
                UIController.createPlayer(uri, data);
            }
        });
    }

    static async loadGenre() {
        const token = await APIController.getToken();
        StorageController.saveToken(token);
        const genres = await APIController.getGenres(token);
        genres.forEach( (genre) => UIController.createGenre(genre))
    }
}

class UIController {
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
    }

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
    }
    
    static createTrack(track) {
        const image = track.album.images[1].url;
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
    }

    static createPlayer(uri, data) {
        const image = data.album.images[0].url
        const widget =
        `
        <button id="back"><a href="/">back</a></button>
        <button id="github"><a href="https://github.com/ianbrdeguzman/spotify-app">github</a></button>
        <div class="img-container">
            <img src="${image}" alt="${data.name}">
        </div>
        <iframe src="https://open.spotify.com/embed/${uri}" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>
        `
        
        playerDOM.insertAdjacentHTML('beforeend', widget);
    }

    static clearDOM(container) {
        while (container.childNodes.length > 0) {
            container.removeChild(container.childNodes[0]);
        }
    }
}

class StorageController {
    static saveToken(token) {
        localStorage.setItem('token', token)
    }

    static getStoredToken() {
        return localStorage.getItem('token');
    }
}

addEventListener('DOMContentLoaded', APPController.setUp());

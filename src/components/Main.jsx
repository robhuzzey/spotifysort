import React from 'react'
import Spotify from '../lib/spotify'

import Track from './Track.jsx'
import Genres from './Genres.jsx'
import User from './User.jsx'

const redirectUri = encodeURIComponent('http://localhost:8080');
const clientId = '214aa492fc5142cda977c15cf3fb40c6';

class Main extends React.Component {

  constructor(props) {
    super(props);
    this.fetchUsersTracks = this.fetchUsersTracks.bind(this);
    this.filterTracksByGenre = this.filterTracksByGenre.bind(this);
    this.resetFilter = this.resetFilter.bind(this);
    this.makePlaylist = this.makePlaylist.bind(this);
    this.state = {
      tracks: [],
      albums: [],
      artists: [],
      nextUserTrackUrl: null,
      error: null,
      filteredTracks: null,
      filteredBy: null,
      userId: null,
      userImage: null
    }
  }

  componentDidMount() {
    this.spotify = new Spotify(clientId, this.props.route.accessToken, redirectUri);
    if(this.spotify) {
      this.spotify.getUser((error, result) => {
        this.setState({
          userId: result.id,
          userImage: (result.images[0] || {}).url
        });
      });
    }
  }

  fetchUsersTracks(nextUrl) {
    this.spotify.getUsersTracks((error, result) => {

      console.log("userTracks", result);

      if(error) return this.handleError(error);
      const tracks = [];
      const albumIds = [];
      const artistIds = [];
      result.items.map(item => {
        albumIds.push(item.track.album.id);
        tracks.push({
          id: item.track.id,
          name: item.track.name,
          albumId: item.track.album.id,
          artistIds: item.track.artists.reduce((accumulator, artist) => {
            artistIds.push(artist.id);
            accumulator.push(artist.id);
            return accumulator;
          }, []),
          genres: item.genres
        });
      });

      this.spotify.getAlbums(albumIds, (error, result) => {
        if(error) return this.handleError(error);
        const albums = [];
        result.albums.map(item => {
          albums.push({
            id: item.id,
            name: item.name,
            genres: item.genres,
            images: item.images[2] || item.images[1] || {}
          });
        });
        this.setState({
          albums: this.state.albums.concat(albums)
        });
      });

      this.spotify.getArtists(artistIds, (error, result) => {
        if(error) return this.handleError(error);
        const artists = [];
        result.artists.map(item => {
          artists.push({
            id: item.id,
            name: item.name,
            genres: item.genres
          });
        });
        this.setState({
          artists: this.state.artists.concat(artists)
        });
      });

      this.setState({
        tracks: this.state.tracks.concat(tracks),
        nextUserTrackUrl: result.next
      })
    }, nextUrl);
  }

  normalizeGenres(artists, track, album) {
    const genres = [];
    artists && artists.map(artist => {
      genres.push(artist.genres);
    });

    track && genres.push(track.genres);
    album && genres.push(album.genres);

    // Merge all the arrays together & stip out duplicates.
    return [].concat.apply([], genres).filter((elem, pos, arr) => {
      return arr.indexOf(elem) == pos;
    }).sort();
  }

  filterTracksByGenre(genre) {
    const filteredTracks = this.state.tracks.filter(track => {
      const album = this.state.albums.find(album => track.albumId == album.id);
      const artists = this.state.artists.filter(artist => track.artistIds.indexOf(artist.id) !== -1);
      const genres = this.normalizeGenres(artists, track, album);
      return genres.indexOf(genre) !== -1;
    });

    this.setState({
      filteredTracks,
      filteredBy: genre
    })
  }

  resetFilter() {
    this.setState({
      filteredTracks: null,
      filteredBy: null
    });
  }

  makePlaylist() {
    const playlistName = prompt('playlist name?', `Playlist: ${this.state.filteredBy}`);
    this.spotify.makePlaylist(this.state.userId, playlistName, (error, result) => {
      if(error) return this.handleError(error);
      const playlistId = result.id;
      const trackIds = this.state.filteredTracks.map(track => { return track.id; });
      this.spotify.addTracks(this.state.userId, playlistId, trackIds, (error, result) => {
        if(error) return this.handleError(error);
        console.log('addTracks', error, result);

        this.spotify.getPlaylist(this.state.userId, playlistId, (error, result) => {
          if(error) return this.handleError(error);
          console.log('PLAYLIST', error, result);
        });

      });
    });
  }

  handleError(error) {
    return this.setState({
      error: error.toString()
    });
  }

  render() {

    return (
      <div>
        <h1>Spotify tracks</h1>

        <User id={this.state.userId} avatarUrl={this.state.userImage} />

        {this.state.filteredBy && 
          <div>
            <h2>FilteredBy: {this.state.filteredBy} <button onClick={this.resetFilter}>Reset</button></h2>
            <div>
              Make a new playlist: <button onClick={this.makePlaylist}>Yes!</button>
            </div>
          </div>
        }
        <button onClick={() => this.fetchUsersTracks()}>Load user tracks</button>
        {this.state.error && <div>{this.state.error}</div>}
        {this.state.tracks &&
          <div>
            {(this.state.filteredTracks || this.state.tracks).map((track, i) => {
              const album = this.state.albums.find(album => track.albumId == album.id);
              const artists = this.state.artists.filter(artist => track.artistIds.indexOf(artist.id) !== -1);
              const genres = this.normalizeGenres(artists, track, album);

              return (
                <div key={i} >
                  <Track track={track} album={album} artists={artists} />
                  <Genres genres={genres} filterTracksByGenre={this.filterTracksByGenre} />
                </div>
              )
            })}
            <button onClick={this.fetchUsersTracks.bind(this, this.state.nextUserTrackUrl)}>Load more</button>
          </div>
        }
      </div>
    )
  }
}

export default Main

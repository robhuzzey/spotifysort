import React from 'react'
import spotify from '../lib/spotify'

import Track from './Track.jsx'

class Main extends React.Component {

  constructor(props) {
    super(props);
    this.fetchUsersTracks = this.fetchUsersTracks.bind(this);
    this.filterTracksByGenre = this.filterTracksByGenre.bind(this);
    this.resetFilter = this.resetFilter.bind(this);
    this.state = {
      tracks: [],
      albums: [],
      artists: [],
      nextUserTrackUrl: null,
      error: null,
      filteredTracks: null,
      filteredBy: null
    }
  }

  fetchUsersTracks(nextUrl) {
    spotify.getUsersTracks(this.props.route.accessToken, (error, result) => {
      if(error) return this.setState({
        error: error.toString()
      });

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

      spotify.getAlbums(this.props.route.accessToken, albumIds.join(','), (error, result) => {
        if(error) return this.setState({
          error: error.toString()
        });
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

      spotify.getArtists(this.props.route.accessToken, artistIds.join(','), (error, result) => {
        if(error) return this.setState({
          error: error.toString()
        });
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

  render() {
    return (
      <div>
        <h1>Spotify tracks</h1>
        {this.state.filteredBy && <h2>FilteredBy: {this.state.filteredBy} <button onClick={this.resetFilter}>Reset</button></h2>}
        <button onClick={() => this.fetchUsersTracks()}>Load user tracks</button>
        {this.state.error && <div>{this.state.error}</div>}
        {this.state.tracks &&
          <div>
            {(this.state.filteredTracks || this.state.tracks).map((track, i) => {

              console.log('track', track);

              const album = this.state.albums.find(album => track.albumId == album.id);
              const artists = this.state.artists.filter(artist => track.artistIds.indexOf(artist.id) !== -1);
              const genres = this.normalizeGenres(artists, track, album);

              return (
                <Track track={track} album={album} artists={artists} genres={genres} key={i} filterTracksByGenre={this.filterTracksByGenre} />
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

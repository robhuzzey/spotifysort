import React from 'react'
import Spotify from '../lib/spotify'

import Track from './Track.jsx'
import Album from './Album.jsx'
import Artist from './Artist.jsx'
import AudioFeatures from './AudioFeatures.jsx'
import TracksAccordion from './TracksAccordion.jsx'
import SpotifyPlayer from './SpotifyPlayer.jsx'
import Genre from './Genre.jsx'
import User from './User.jsx'

import { Accordion, Panel, ButtonGroup, Button, Badge, Col, Row, Grid } from 'react-bootstrap';

const redirectUri = encodeURIComponent('http://www.robhuzzey.co.uk/spotifysort/');
const clientId = '214aa492fc5142cda977c15cf3fb40c6';

class Main extends React.Component {

  constructor(props) {
    super(props);
    this.fetchUsersTracks = this.fetchUsersTracks.bind(this);
    this.filterTracksByGenre = this.filterTracksByGenre.bind(this);
    this.resetFilter = this.resetFilter.bind(this);
    this.makePlaylist = this.makePlaylist.bind(this);
    this.filterResults = this.filterResults.bind(this);
    this.filterResults2 = this.filterResults2.bind(this);
    this.clearGenre = this.clearGenre.bind(this);
    this.state = {
      tracks: [],
      albums: [],
      artists: [],

      filteredTracks: {},
      
      audioFeatures: [],
      nextUserTrackUrl: null,
      error: null,
      filteredBy: null,
      userId: null,
      userImage: null,
      trackLimit: 20,
      trackOffset: 0,
      loading: false
    }
  }

  componentDidMount() {
    this.spotify = new Spotify(clientId, this.props.route.accessToken, redirectUri);
    if(this.spotify) {
      this.spotify.getUser((error, result) => {
        if(error) {
          return this.spotify.authorize();
        }
        this.setState({
          userId: result.id,
          userImage: (result.images[0] || {}).url
        });
      });
    }
  }

  fetchUsersTracks(nextUrl) {
    this.setState({
      loading: true
    });
    this.spotify.getUsersTracks(this.state.trackLimit, this.state.trackOffset, (error, result) => {

      if(error) return this.handleError(error);
      const tracks = result.items.map(item => {
        return item.track;
      });

      if(tracks.length) {
        this.spotify.getAudioFeatures(tracks.map(track => track.id), (error, result) => {
          console.log("audio features", result);
          if(error) return this.handleError(error);
          this.setState({
            audioFeatures: this.state.audioFeatures.concat(result.audio_features)
          });
        });
      }

      const albumIds = this.normalizeAlbumIds(tracks, this.state.albums);
      const artistIds = this.normalizeArtistIds(tracks, this.state.artists);

      if(albumIds.length) {
        this.spotify.getAlbums(albumIds, (error, result) => {
          if(error) return this.handleError(error);
          const albums = result.albums;
          this.setState({
            albums: this.state.albums.concat(albums)
          });
        });
      }

      if(artistIds.length) {
        this.spotify.getArtists(artistIds, (error, result) => {
          if(error) return this.handleError(error);
          const artists = result.artists;
          this.setState({
            artists: this.state.artists.concat(artists)
          });
        });
      }

      this.setState({
        tracks: this.state.tracks.concat(tracks),
        nextUserTrackUrl: result.next,
        trackOffset: this.state.trackOffset + this.state.trackLimit,
        loading: false
      })
    }, nextUrl);
  }

  normalizeAlbumIds(tracks, albums) {
    const albumIds = [];
    const existingAlbumIds = albums.map(album => { return album.id; });
    tracks.map(track => {
      if(existingAlbumIds.indexOf(track.album.id) === -1) {
        albumIds.push(track.album.id);
      }
    });
    return albumIds;
  }

  normalizeArtistIds(tracks, artists) {
    const artistIds = [];
    const existingArtistIds = artists.map(artist => { return artist.id; });
    tracks.map(track => {
      track.artists.map(artist => {
        if(existingArtistIds.indexOf(artist.id) === -1) {
          artistIds.push(artist.id);
        }
      })
    });
    return artistIds;
  }

  normalizeGenres(artists, track, album) {
    const genres = [];
    artists && artists.map(artist => {
      if(artist) {
        genres.push(artist.genres);
      }
    });

    track && genres.push(track.genres);
    album && genres.push(album.genres);

    // Merge all the arrays together & stip out duplicates.
    return [].concat.apply([], genres).filter((elem, pos, arr) => {
      return arr.indexOf(elem) == pos;
    }).sort();
  }

  filterTracksByGenre(genre) {
    const filteredTracks = this.state.filteredTracks;
    const tracks = this.filterResults2(genre);
    filteredTracks[genre] = tracks;
    this.setState({
      filteredTracks
    });
  }

  resetFilter() {
    this.setState({
      filteredTracks: this.state.tracks,
      filteredBy: null
    });
  }

  makePlaylist(genre) {
    const playlistName = prompt('playlist name?', `Playlist: ${genre}`);
    this.spotify.makePlaylist(this.state.userId, playlistName, (error, result) => {
      if(error) return this.handleError(error);
      const playlistId = result.id;
      
      const filteredTracks = this.filterResults2(genre);
      const trackIds = filteredTracks.map(result => {
        if(result && result.track) {
          return result.track.id;
        }
      });

      const filteredTrackIds = trackIds.filter(id => {
        if(id === undefined) return false;
        return trackIds.indexOf(id) !== -1;
      });

      const batch = 60;
      for(let i = 0, len = filteredTrackIds.length; i < len; i += batch) {
        this.spotify.addTracks(this.state.userId, playlistId, filteredTrackIds.slice(i, i+batch), (error, result) => {
          if(error) return this.handleError(error);
          this.spotify.getPlaylist(this.state.userId, playlistId, (error, result) => {
            console.log('playlist', result);
            this.setState({
              playListURI: result.uri
            });
            if(error) return this.handleError(error);
          });
        });
      }
    });
  }

  handleError(error) {
    return this.setState({
      error: error.toString()
    });
  }

  filterResults() {
    return this.state.tracks.map((track, i) => {
      const audioFeatures = this.state.audioFeatures.find(features => features.id === track.id);
      const album = this.state.albums.find(album => track.album.id === album.id);
      const artists = track.artists.map(trackArtist => {
        return this.state.artists.find(artist => {
          return artist.id === trackArtist.id;
        });
      });
      const genres = this.normalizeGenres(artists, track, album);
      if(this.state.filteredBy && genres.indexOf(this.state.filteredBy) === -1) return null;
      return {
        track,
        album,
        artists,
        genres,
        audioFeatures
      }
    }).filter(result => result);
  }

  filterResults2(genre) {
    return this.state.tracks.map((track, i) => {
      const audioFeatures = this.state.audioFeatures.find(features => features.id === track.id);
      const album = this.state.albums.find(album => track.album.id === album.id);
      const artists = track.artists.map(trackArtist => {
        return this.state.artists.find(artist => {
          return artist.id === trackArtist.id;
        });
      });
      const genres = this.normalizeGenres(artists, track, album);
      if(genres.indexOf(genre) === -1) return null;
      return {
        track,
        album,
        artists,
        genres,
        audioFeatures
      }
    }).filter(result => result);
  }

  clearGenre(genre) {

    console.log(genre);

    const filteredTracks = this.state.filteredTracks;
    delete filteredTracks[genre];
    this.setState({
      filteredTracks
    });
  }

  render() {

    const results = this.filterResults();

    if(this.state.playListURI) {
      return (
        <div>
          <h1>Playlist created</h1>
          <SpotifyPlayer uri={this.state.playListURI} width={200} height={1000} />
        </div>
      )
    }

    return (
      <Grid>
        <Row>
          <Col xs={12} md={12}>
            <h1>Spotify tracks testing the length of this title as it should be all the way across the page!</h1>

            <User id={this.state.userId} avatarUrl={this.state.userImage} />

            {this.state.nextUserTrackUrl ? 
              <Button bsStyle={this.state.loading ? "warning" : "success"} disabled={this.state.loading ? true : false} onClick={this.fetchUsersTracks.bind(this, this.state.nextUserTrackUrl)}>{this.state.loading ? "Loading..." : "Load more"}</Button>
              : 
              <Button bsStyle="success" onClick={() => this.fetchUsersTracks()}>Load users tracks</Button>
            }

            <p>Tracks <Badge>{results.length}</Badge></p>
            
            {this.state.error && <div>{this.state.error}</div>}
          </Col>
        </Row>

        <Row>
          <Col xs={12} md={8}>
            {results && results.length &&
              <div>
                {results.map((result, i) => {
                  if(!Object.keys(result).length) return;
                  return (
                    <div key={i}>
                      {result.track && <Track track={result.track} />}
                      <div>
                        {result.genres.map((genre, i) => {
                          if(genre) {
                            return <Genre genre={genre} filteredGenre={this.state.filteredBy} filterTracksByGenre={this.filterTracksByGenre} key={i} />
                          }
                        })}
                      </div>
                      <hr />
                    </div>
                  )
                })}
              </div>
            }
          </Col>
          <Col xs={6} md={4}>
            {this.state.filteredTracks &&
              <TracksAccordion 
                tracks={this.state.filteredTracks} 
                makePlaylist={this.makePlaylist}
                clearGenre={this.clearGenre} />
            }
          </Col>
        </Row>

      </Grid>
    )
  }
}

export default Main

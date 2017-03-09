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
import LoadingBar from './LoadingBar.jsx'

import { Accordion, Panel, ButtonGroup, Button, Badge, Col, Row, Grid } from 'react-bootstrap';

const redirectUri = encodeURIComponent('http://www.robhuzzey.co.uk/spotifysort/');
const clientId = '214aa492fc5142cda977c15cf3fb40c6';

class Main extends React.Component {

  constructor(props) {
    super(props);
    this.filterTracksByGenre = this.filterTracksByGenre.bind(this);
    this.resetFilter = this.resetFilter.bind(this);
    this.makePlaylist = this.makePlaylist.bind(this);
    this.filterResults = this.filterResults.bind(this);
    this.clearGenre = this.clearGenre.bind(this);
    this.getAllTracks = this.getAllTracks.bind(this);
    this.tracksLoaded = this.tracksLoaded.bind(this);
    this.state = {
      totalTracks: 0,
      totalArtists: 0,
      totalAlbums: 0,
      tracks: [],
      albums: [],
      artists: [],
      albumIds: [],
      artistIds: [],

      filteredTracks: {},
      
      audioFeatures: [],
      nextUserTrackUrl: null,
      error: null,
      filteredBy: null,
      userId: null,
      userImage: null,
      trackLimit: 20,
      trackOffset: 0,
      status: null
    }
  }

  componentDidMount() {
    this.spotify = new Spotify(clientId, this.props.accessToken, redirectUri);
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

  getAllTracks(trackLimit = this.state.trackLimit, trackOffset = this.state.trackOffset) {
    this.setState({
      status: 'fetchingTracks'
    });

    this.spotify.getUsersTracks(this.state.trackLimit, this.state.trackOffset, (error, result) => {

      if(error) return this.handleError(error);
      const tracks = result.items.map(item => {
        return item.track;
      });

      const modifiedTrackOffset = this.state.trackOffset + this.state.trackLimit
      this.setState({
        tracks: this.state.tracks.concat(tracks),
        nextUserTrackUrl: result.next,
        trackOffset: modifiedTrackOffset,
        totalTracks: result.total
      });

      if(result.next) {
        this.getAllTracks(this.state.trackLimit, trackOffset);
      } else {
        const albumIds = this.normalizeAlbumIds(this.state.tracks);
        const artistIds = this.normalizeArtistIds(this.state.tracks);
        this.setState({
          albumIds,
          artistIds,
          totalAlbums: albumIds.length,
          totalArtists: artistIds.length,
          status: 'analyzingTracks'
        });
        this.getAllAlbums(albumIds);
        this.getAllArtists(artistIds);
      }
    });
  }

  getAllAlbums(ids, start = 0, limit = 20) {
    const albumIds = ids.slice(start, start + limit);
    if(albumIds.length) {
      this.spotify.getAlbums(albumIds, (error, result) => {
        if(error) return this.handleError(error);
        const albums = result.albums;
        this.setState({
          albums: this.state.albums.concat(albums)
        });
        this.getAllAlbums(ids, start + limit)
      });
    }
  }

  getAllArtists(ids, start = 0, limit = 20) {
    const artistIds = ids.slice(start, start + limit);

    if(artistIds.length) {
      this.spotify.getArtists(artistIds, (error, result) => {
        if(error) return this.handleError(error);
        const artists = result.artists;
        this.setState({
          artists: this.state.artists.concat(artists)
        });
        this.getAllArtists(ids, start + limit)
      });
    }
  }

  normalizeAlbumIds(tracks) {
    return tracks.map(track => { 
      return track.album.id;
    }).filter((elem, pos, arr) => {
      return arr.indexOf(elem) == pos;
    });
  }

  normalizeArtistIds(tracks) {
    const artistIds = [];
    tracks.map(track => { 
      track.artists.map(artist => {
        if(artistIds.indexOf(artist.id) === -1) {
          artistIds.push(artist.id);
        }
      })
    });
    return artistIds;
  }

  normalizeGenres(artists, tracks, albums) {
    const genres = [];
    artists && artists.map(artist => {
      artist && genres.push(artist.genres);
    });

    tracks && tracks.map(track => {
      track && genres.push(track.genres);
    });

    albums && albums.map(album => {
      album && genres.push(album.genres);
    });

    // Merge all the arrays together & stip out duplicates.
    return [].concat.apply([], genres).filter((elem, pos, arr) => {
      return arr.indexOf(elem) == pos;
    }).sort();
  }

  filterTracksByGenre(genre) {
    const filteredTracks = this.state.filteredTracks;
    const tracks = this.filterResults(genre);
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

  // Probably don't need to filter results here again? Can we use the object already filtered?
  makePlaylist(genre) {
    const playlistName = prompt('playlist name?', `Playlist: ${genre}`);
    this.spotify.makePlaylist(this.state.userId, playlistName, (error, result) => {
      if(error) return this.handleError(error);
      const playlistId = result.id;
      
      const filteredTracks = this.filterResults(genre);
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

  filterResults(genre) {
    return this.state.tracks.map((track, i) => {
      const audioFeatures = this.state.audioFeatures.find(features => features.id === track.id);
      const album = this.state.albums.find(album => track.album.id === album.id);
      const artists = track.artists.map(trackArtist => {
        return this.state.artists.find(artist => {
          return artist.id === trackArtist.id;
        });
      });
      const genres = this.normalizeGenres(artists, [track], [album]);
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
    const filteredTracks = this.state.filteredTracks;
    delete filteredTracks[genre];
    this.setState({
      filteredTracks
    });
  }

  tracksLoaded() {
    const tracksLoaded = this.state.tracks.length > 0 && this.state.tracks.length === this.state.totalTracks;
    const albumsLoaded = this.state.albums.length === this.state.totalAlbums;
    const artistsLoaded = this.state.artists.length === this.state.totalArtists;
    if(tracksLoaded && albumsLoaded && artistsLoaded && this.state.status !== 'tracksLoaded') {
      this.setState({
        status: 'tracksLoaded'
      });
    }
  }

  componentDidUpdate() {
    this.tracksLoaded();
  }

  render() {

    if(this.state.playListURI) {
      return (
        <div>
          <h1>Playlist created</h1>
          <SpotifyPlayer uri={this.state.playListURI} width={200} height={1000} />
          <Button onClick={() => {
            this.setState({
              playListURI: null
            })
          }}>Start again?</Button>
        </div>
      )
    }



    return (
      <Grid>
        <Row>
          <Col xs={12} md={12}>
            <h1>Spotify Genre playlist maker</h1>
            <p>This is a work in progress but the idea is to allow you to load in your latest songs, choose a genre & then create a playlist based off that list.</p>

            <p>Contact me on twitter if you want more info: <a href="https://twitter.com/theHuzz">@theHuzz</a></p>

            <User id={this.state.userId} avatarUrl={this.state.userImage} />

            {this.state.status === null && <Button bsStyle="success" onClick={this.getAllTracks}>Get ALL tracks</Button>}

            {this.state.status === 'fetchingTracks' &&
              <div>
                <h2>Getting tracks...</h2>
                <LoadingBar current={this.state.tracks.length} total={this.state.totalTracks} />
              </div>
            }
            
            {this.state.status === 'analyzingTracks' &&
              <div>
                <h2>Analyzing tracks</h2>
                <div>Albums: <LoadingBar verb="Analyzing" current={this.state.albums.length} total={this.state.totalAlbums} /></div>
                <div>Artists: <LoadingBar verb="Analyzing" current={this.state.artists.length} total={this.state.totalArtists} /></div>
              </div>
            }
            
            {this.state.error && <div>{this.state.error}</div>}
          </Col>
        </Row>

        {this.state.status === 'tracksLoaded' &&
          <Row>
            <Col xs={12} md={12}>
              <div>
                <h2>Genres</h2>
                {this.normalizeGenres(this.state.artists, this.state.tracks, this.state.albums).map((genre, i) => {
                  if(genre) {
                    const count = this.filterResults(genre).length;
                    return <Genre genre={genre} filteredGenre={this.state.filteredBy} filterTracksByGenre={this.filterTracksByGenre} count={count} key={i} />
                  }
                })}
              </div>
            </Col>
          </Row>
        }

        <Row>
          <Col xs={12} md={12}>
            {this.state.filteredTracks &&
              <TracksAccordion 
                tracks={this.state.filteredTracks} 
                makePlaylist={this.makePlaylist}
                clearGenre={this.clearGenre} />
            }
          </Col>
        </Row>

        {/*
        <Row>
          <Col xs={12} md={8}>
            {results && (results.length > 0) &&
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
                      {result.audioFeatures && <AudioFeatures audioFeatures={result.audioFeatures} />}
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
      */}

      </Grid>
    )
  }
}

export default Main

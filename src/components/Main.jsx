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

import ReactSelect from 'react-select'
import 'react-select/dist/react-select.css';

import { Accordion, Glyphicon, Panel, ButtonToolbar, ButtonGroup, Button, Badge, Col, Row, Grid } from 'react-bootstrap';

const redirectUri = encodeURIComponent('http://www.robhuzzey.co.uk/spotifysort/');
const clientId = '214aa492fc5142cda977c15cf3fb40c6';


const MusicPlayer = props => {
  return (
    <div>
      <button onClick={props.pause.bind(this)}>Pause</button>
      {props.tracks.map((track, i) => {
        return (
          <Grid key={i} onClick={props.play.bind(this, track.url)}>
            <Row>
              <Col xs={3} md={3}>
                <img src={track.img} />
              </Col>
              <Col xs={9} md={9}>
                <Grid>
                  <Row>
                    <Col xs={12} md={12}>{track.name}</Col>
                  </Row>
                  {track.artists &&
                    <Row>
                      <Col xs={12} md={12}>
                        {track.artists.map(artist => {
                          return <span>{artist.name}</span>
                        })}
                      </Col>
                    </Row>
                  }
                </Grid>
              </Col>
            </Row>
          </Grid>
        )
      })}
    </div>
  )
}



class Main extends React.Component {

  constructor(props) {
    super(props);
    this.filterTracksByGenre = this.filterTracksByGenre.bind(this);
    this.makePlaylist = this.makePlaylist.bind(this);
    this.filterResults = this.filterResults.bind(this);
    this.clearGenre = this.clearGenre.bind(this);
    this.clearRecommendations = this.clearRecommendations.bind(this);
    this.getAllTracks = this.getAllTracks.bind(this);
    this.tracksLoaded = this.tracksLoaded.bind(this);
    this.getRecommendations = this.getRecommendations.bind(this);

    this.play = this.play.bind(this);
    this.pause = this.pause.bind(this);
    this.state = {
      totalTracks: 0,
      totalArtists: 0,
      totalAlbums: 0,
      tracks: [],
      albums: [],
      artists: [],
      albumIds: [],
      artistIds: [],

      recommendations: [],

      filteredTracks: [],
      filteredBy: '',
      
      audioFeatures: [],
      nextUserTrackUrl: null,
      error: null,
      filteredBy: null,
      userId: null,
      userImage: null,
      requestLimit: 20,
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

  play(src) {
    this.setState({
      src
    }, () => {
      this.audioEl.play()
    })
  }

  pause() {
    this.audioEl.pause()
  }

  getAllTracks(requestLimit = this.state.requestLimit, trackOffset = this.state.trackOffset) {
    this.setState({
      status: 'fetchingTracks'
    });

    this.spotify.getUsersTracks(this.state.requestLimit, this.state.trackOffset, (error, result) => {

      if(error) return this.handleError(error);
      const tracks = result.items.map(item => {
        return item.track;
      });

      const modifiedTrackOffset = this.state.trackOffset + this.state.requestLimit
      this.setState({
        tracks: this.state.tracks.concat(tracks),
        nextUserTrackUrl: result.next,
        trackOffset: modifiedTrackOffset,
        totalTracks: result.total
      });

      if(result.next) {
        this.getAllTracks(this.state.requestLimit, trackOffset);
      } else {
        const albumIds = this.normalizeAlbumIds(this.state.tracks);
        const artistIds = this.normalizeArtistIds(this.state.tracks);
        const trackIds = this.normalizeTrackIds(this.state.tracks);
        this.setState({
          albumIds,
          artistIds,
          trackIds,
          totalAlbums: albumIds.length,
          totalArtists: artistIds.length,
          status: 'analyzingTracks'
        });
        this.getAllAlbums(albumIds);
        this.getAllArtists(artistIds);
      }
    });
  }

  getAllAlbums(ids, start = 0, limit = this.state.requestLimit) {
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

  getAllArtists(ids, start = 0, limit = this.state.requestLimit) {
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

  normalizeTrackIds(tracks) {
    return tracks.map(track => { 
      return track.id;
    }).filter((elem, pos, arr) => {
      return arr.indexOf(elem) == pos;
    });
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
    this.setState({
      filteredBy: genre
    });
  }

  getRecommendations() {
    this.spotify.getTrackRecommendations(this.state.filteredTracks.map(track => {return track.id;}).sort(() => {
      return .5 - Math.random();
    }).slice(0,5), (error, result) => {
      this.setState({
        recommendations: result.tracks
      });
    });
  }

  // Probably don't need to filter results here again? Can we use the object already filtered?
  makePlaylist(tracks) {
    const playlistName = prompt('playlist name?', `Playlist: ${this.state.filteredBy}`);
    this.spotify.makePlaylist(this.state.userId, playlistName, (error, result) => {
      if(error) return this.handleError(error);
      const playlistId = result.id;
      
      const trackIds = tracks.map(track => {
        if(track) {
          return track.id;
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
      const album = this.state.albums.find(album => track.album.id === album.id);
      const artists = track.artists.map(trackArtist => {
        return this.state.artists.find(artist => {
          return artist.id === trackArtist.id;
        });
      });
      const genres = this.normalizeGenres(artists, [track], [album]);
      if(genres.indexOf(genre) === -1) return null;
      return track;
    }).filter(result => result);
  }

  clearGenre() {
    this.setState({
      filteredTracks: [],
      filteredBy: ''
    });
  }

  clearRecommendations() {
    this.setState({
      recommendations: []
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

    if(this.state.filteredBy && this.state.filteredTracks.length === 0) {
      const results = this.filterResults(this.state.filteredBy);
      this.setState({
        filteredTracks: results
      });
    }

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

            <audio src={this.state.src} ref={(ref) => {this.audioEl = ref;}}>
              Your browser does not support the <code>audio</code> element.
            </audio>

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
          <div>
            <Row>
              <Col xs={12} md={12}>
                <h2>Filter by Genre</h2>
              </Col>
            </Row>

            <Row>
              <Col xs={8} md={8}>
                <ReactSelect 
                  value={this.state.filteredBy}
                  options={this.normalizeGenres(this.state.artists, this.state.tracks, this.state.albums).map((genre, i) => {
                    return {
                      value: genre,
                      label: genre
                    }
                  })}
                  onChange={(option) => this.filterTracksByGenre(option && option.value || null)} />
              </Col>
              <Col xs={4} md={4}>
                <Button bsStyle="danger" onClick={this.clearGenre}>Clear Filter</Button>
              </Col>
            </Row>

          </div>
        }

        {this.state.filteredBy &&
          <Row>
            <Col xs={6} md={6}>
              <h2>Filtered by: {this.state.filteredBy}</h2>
              <ButtonToolbar>
                <ButtonGroup>
                  <Button onClick={() => this.makePlaylist(this.state.filteredTracks)}><Glyphicon glyph="save" /> Save Playlist</Button>
                  <Button onClick={this.clearGenre}><Glyphicon glyph="trash" /> Clear</Button>
                </ButtonGroup>
              </ButtonToolbar>
              <MusicPlayer tracks={this.state.filteredTracks.map(track => {
                console.log(track)
                const album = track.album || {};
                return {
                  name: track.name,
                  artists: track.artists.map(artist => {
                    return {
                      name: artist.name
                    }
                  }),
                  url: track.preview_url,
                  img: (album.images[2] || album.images[1] || album.images[0] || {}).url
                }
              })} play={this.play} pause={this.pause} />

            </Col>

            <Col xs={6} md={6}>
              <h2>Recommendations</h2>
              <ButtonToolbar>
                <ButtonGroup>
                  {this.state.recommendations.length === 0 && <Button onClick={this.getRecommendations}><Glyphicon glyph="search" /> Get Recommendations</Button>}
                  {this.state.recommendations.length > 0 &&
                    <div>
                      <Button onClick={() => this.makePlaylist(this.state.recommendations)}><Glyphicon glyph="save" /> Save Playlist</Button>
                      <Button onClick={this.clearRecommendations}><Glyphicon glyph="trash" /> Clear Recommendations</Button>
                    </div>
                  }
                </ButtonGroup>
              </ButtonToolbar>
              <MusicPlayer tracks={this.state.recommendations.map(track => {
                const album = track.album || {};
                return {
                  name: track.name,
                  artists: track.artists.map(artist => {
                    return {
                      name: artist.name
                    }
                  }),
                  url: track.preview_url,
                  img: (album.images[2] || album.images[1] || album.images[0] || {}).url
                }
              })} play={this.play} pause={this.pause} />
            </Col>
          </Row>
        }
      </Grid>
    )
  }
}

export default Main

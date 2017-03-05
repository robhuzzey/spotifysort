'use strict';

const request = require('superagent');
const jsonp = require('superagent-jsonp');

class Spotify {
  constructor(clientId, accessToken, redirectUri) {
    this._api = 'https://api.spotify.com/v1';
    this._scopes = [
      'user-library-read',
      'user-library-modify',
      'user-read-private',
      'playlist-modify-public'
    ];
    this._clientId = clientId;
    this._accessToken = accessToken;
    this._redirectUri = redirectUri;
    if(!accessToken) return this.authorize();
  }

  _auth_get_request = (endpoint, params = {}, callback) => {
    return request
      .get(this._api + endpoint)
      .query(params)
      .set('Authorization', `Bearer ${this._accessToken}`)
      .end(function(error, res) {
        if (error || !res.body) return callback(error || 'missing body', null);
        return callback(null, res.body);
      });
  }

  _auth_post_request = (endpoint, body = {}, callback) => {
    return request
      .post(this._api + endpoint)
      .send(body)
      .set('Authorization', `Bearer ${this._accessToken}`)
      .set('Content-Type', 'application/json')
      .end(function(error, res) {
        if (error || !res.body) return callback(error || 'missing body', null);
        return callback(null, res.body);
      });
  }

  authorize = () => {
    const scopes = encodeURIComponent(this._scopes.join(' '));
    window.location = `https://accounts.spotify.com/authorize?client_id=${this._clientId}&scope=${scopes}&show_dialog=true&response_type=token&redirect_uri=${this._redirectUri}`;
    return;
  }

  getUsersTracks = (limit = 20, offset = 0, callback) => {
    const endpoint = '/me/tracks';
    return this._auth_get_request(endpoint, {limit, offset}, callback);
  }

  getAlbums = (ids, callback) => {
    const endpoint = '/albums';
    const query = {
      ids: ids.join(',')
    };
    return this._auth_get_request(endpoint, query, callback);
  }

  getArtists = (ids, callback) => {
    const endpoint = '/artists';
    const query = {
      ids: ids.join(',')
    };
    return this._auth_get_request(endpoint, query, callback);
  }

  getUser = callback => {
    const endpoint = '/me';
    return this._auth_get_request(endpoint, null, callback);
  }

  makePlaylist = (userId, name, callback) => {
    const endpoint = `/users/${userId}/playlists`;
    return this._auth_post_request(endpoint, {
      name
    }, callback);
  }

  addTracks = (userId, playlistId, trackIds, callback) => {
    const endpoint = `/users/${userId}/playlists/${playlistId}/tracks`;
    return this._auth_post_request(endpoint, {
      uris: trackIds.map(id => { return `spotify:track:${id}` })
    }, callback);
  }

  getPlaylist = (userId, playlistId, callback) => {
    const endpoint = `/users/${userId}/playlists/${playlistId}`;
    return this._auth_get_request(endpoint, null, callback);
  }

  getAudioFeatures = (ids, callback) => {
    const endpoint = '/audio-features';
    const query = {
      ids: ids.join(',')
    };
    return this._auth_get_request(endpoint, query, callback);
  }

}

export default Spotify

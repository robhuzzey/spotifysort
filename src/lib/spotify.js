'use strict';

const request = require('superagent');
const jsonp = require('superagent-jsonp');

const client_id = '214aa492fc5142cda977c15cf3fb40c6';
const redirect_uri = encodeURIComponent('http://localhost:8080');

const spotify = {};

spotify.authorize = callback => {
  const scopes = encodeURIComponent('user-library-read user-library-modify');
  window.location = `https://accounts.spotify.com/authorize?client_id=${client_id}&scope=${scopes}&show_dialog=true&response_type=token&redirect_uri=${redirect_uri}`;
}

spotify.getUsersTracks = (access_token, callback, url = 'https://api.spotify.com/v1/me/tracks') => {
  return request
    .get(url)
    .set('Authorization', `Bearer ${access_token}`)
    .end(function(error, res) {
      if (error || !res.body) return callback(error || 'missing body', null);
      return callback(null, res.body);
    });
}

spotify.getAlbums = (access_token, ids, callback, url = 'https://api.spotify.com/v1/albums') => {
  return request
    .get(url)
    .query({
      ids
    })
    .end(function(error, res) {
      if (error || !res.body) return callback(error || 'missing body', null);
      return callback(null, res.body);
    });
}

spotify.getArtists = (access_token, ids, callback, url = 'https://api.spotify.com/v1/artists') => {
  return request
    .get(url)
    .query({
      ids
    })
    .end(function(error, res) {
      if (error || !res.body) return callback(error || 'missing body', null);
      return callback(null, res.body);
    });
}

export default spotify

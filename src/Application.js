import React from 'react'
import { render } from 'react-dom'
import { Router, Route, Link, browserHistory } from 'react-router'

import spotify from './lib/spotify'

import Main from './components/Main.jsx'

const hash = window.location.hash;

const parseHash = hash => {
  return hash.replace('#','')
    .split('&')
    .reduce((accumulator, part) => {
      let parts = part.split('=');
      if (parts.length === 2) {
        accumulator[parts[0]] = parts[1];
      }
      return accumulator;
    },
  {});
}

(() => {

  const parsedHash = parseHash(hash);
  if (!parsedHash.access_token) return spotify.authorize();

  render((
    <Router history={browserHistory}>
      <Route path="/" component={Main} accessToken={parsedHash.access_token} />
    </Router>
  ), document.getElementById('application'))
})()


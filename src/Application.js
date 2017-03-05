import React from 'react'
import { render } from 'react-dom'

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
  render((
    <Main accessToken={parsedHash.access_token} />
  ), document.getElementById('application'))
})()


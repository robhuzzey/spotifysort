import React from 'react'

import { Badge } from 'react-bootstrap';

const Genre = props => {
  return (
    <Badge onClick={e => {
      e.preventDefault();
      e.stopPropagation();
      props.filterTracksByGenre(props.genre);
    }}>{props.genre}</Badge>
  )
}

export default Genre;

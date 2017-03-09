import React from 'react'

import { Badge, Button } from 'react-bootstrap';

const Genre = props => {
  return (
    <Button bsStyle="info" onClick={e => {
      e.preventDefault();
      e.stopPropagation();
      props.filterTracksByGenre(props.genre);
    }}>{props.genre} <Badge>{props.count}</Badge></Button>
  )
}

export default Genre;

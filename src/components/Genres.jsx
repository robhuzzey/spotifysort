import React from 'react'

const Genre = props => {
  return (
    <ul>
      {props.genres.map(genre => {
        return <li><a href="#" onClick={e => {
          e.preventDefault();
          e.stopPropagation();
          props.filterTracksByGenre(genre);
        }}>{genre}</a></li>
      })}
    </ul>
  )
}

export default Genre;

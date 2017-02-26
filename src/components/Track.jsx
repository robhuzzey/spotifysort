import React from 'react'

const Track = props => {
  return (
    <div>
      {props.album && props.album.images && props.album.images.url && <img src={props.album.images.url} />} {props.track.name}
      <ul>
        {props.genres.map(genre => {
          return <li><a href="#" onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            props.filterTracksByGenre(genre);
          }}>{genre}</a></li>
        })}
      </ul>
    </div>
  )
}

export default Track;

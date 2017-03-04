import React from 'react'

const Track = props => {
  return (
    <div>
      {props.album && props.album.images && props.album.images.url && <img src={props.album.images.url} />} {props.track.name}
    </div>
  )
}

export default Track;

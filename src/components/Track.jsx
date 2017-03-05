import React from 'react'

const Track = props => {
  console.log('props.track', props.track);
  const albumImageUrl = props.track.album && props.track.album.images && (props.track.album.images[2] || props.track.album.images[1] || props.track.album.images[0] || {}).url;
  return (
    <div>
      {albumImageUrl && <img src={albumImageUrl} />} {props.track.name}      
    </div>
  )
}

export default Track;

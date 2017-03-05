import React from 'react'

const Album = props => {
  // console.log('props.album', props.album);
  // const albumImageUrl = props.track.album && props.track.album.images && (props.track.album.images[2] || props.track.album.images[1] || props.track.album.images[0] || {}).url;
  return (
    <div>
      {props.album.name}
    </div>
  )
}

export default Album;

import React from 'react'

const Artist = props => {
  // console.log('props.artist', props.artist);
  // const albumImageUrl = props.track.album && props.track.album.images && (props.track.album.images[2] || props.track.album.images[1] || props.track.album.images[0] || {}).url;
  return (
    <div>
      {props.artist.name}
    </div>
  )
}

export default Artist;

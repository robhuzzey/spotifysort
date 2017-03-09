import React from 'react'

const SpotifyPlayer = props => {
  return (
    <div>
      <iframe src={`https://embed.spotify.com/?uri=${props.uri}`} width={props.width} height={props.height} frameBorder="0" allowTransparency="true"></iframe>
    </div>
  )
}

export default SpotifyPlayer;

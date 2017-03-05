import React from 'react'

const AudioFeatures = props => {
  return (
    <div>
      Energy: {props.audioFeatures.energy} / Valance: {props.audioFeatures.valance} (0.00 Dark or happy 1.00) / Tempo: {props.audioFeatures.tempo}
    </div>
  )
}

export default AudioFeatures;

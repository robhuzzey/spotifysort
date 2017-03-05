import React from 'react'

const Genre = props => {
  const style = props.filteredGenre === props.genre ? {color: 'red'} : {};
  return (
    <span style={style}><a style={style} href="#" onClick={e => {
      e.preventDefault();
      e.stopPropagation();
      props.filterTracksByGenre(props.genre);
    }}>{props.genre}</a> | </span>
  )
}

export default Genre;

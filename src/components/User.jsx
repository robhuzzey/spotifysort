import React from 'react'

const User = props => {
  return (
    <div>
      <h2>{props.id}</h2>
      <div><img src={props.avatarUrl} /></div>
    </div>
  )
}

export default User;

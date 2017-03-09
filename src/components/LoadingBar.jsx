import React from 'react'
import { ProgressBar } from 'react-bootstrap';

const LoadingBar = props => {

  if(props.current < 1 || props.total < 0) return null;

  const progressNumber = Math.round((((props.current || 1) / (props.total || 1)) * 100));

  return (
    <div>
      <ProgressBar striped now={progressNumber} label={`${props.verb} ${props.current} of ${props.total} (${progressNumber}%)`} />
    </div>
  )
}

LoadingBar.propTypes = { 
  current: React.PropTypes.number.isRequired,
  total: React.PropTypes.number.isRequired,
  verb: React.PropTypes.string.isRequired,
};
LoadingBar.defaultProps = {
  verb: 'Loading'
};

export default LoadingBar;

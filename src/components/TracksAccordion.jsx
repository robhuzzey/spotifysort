import React from 'react'
import AudioFeatures from './AudioFeatures.jsx'
import SpotifyPlayer from './SpotifyPlayer.jsx'
import { Accordion, Panel, ButtonGroup, Button, Badge } from 'react-bootstrap';

const TracksAccordion = props => {
  return (
    <Accordion>
      {Object.keys(props.tracks).map((genre, i) => {
        const header = <span>{genre} <Badge>{props.tracks[genre].length}</Badge></span>;
        return (
          <Panel header={header} eventKey={i}>
            <ButtonGroup className="pull-right">
              <Button bsStyle="success" onClick={props.makePlaylist.bind(this, genre)}>Make Playlist</Button>
              <Button bsStyle="danger" onClick={props.clearGenre.bind(this, genre)}>Clear</Button>
            </ButtonGroup>
            <div>
              {props.tracks[genre].map((result, i) => {
                if(!Object.keys(result).length) return;
                return (
                  <div key={i}>
                    <SpotifyPlayer uri={result.track.uri} height={100} />
                    {result.audioFeatures && <AudioFeatures audioFeatures={result.audioFeatures} />}
                    <hr />
                  </div>
                )
              })}
            </div>
          </Panel>
        );
      })}
    </Accordion>
  )
}

export default TracksAccordion;

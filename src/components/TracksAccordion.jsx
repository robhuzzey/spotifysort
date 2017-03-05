import React from 'react'
import AudioFeatures from './AudioFeatures.jsx'
import SpotifyPlayer from './SpotifyPlayer.jsx'
import { Glyphicon, PanelGroup, Panel, ButtonToolbar, ButtonGroup, Button, Badge } from 'react-bootstrap';


class TracksAccordion extends React.Component {
  constructor(props) {
    super(props);
    this.handleSelect = this.handleSelect.bind(this);
    this.state = {
      activeKey: 0
    }
  }

  handleSelect(activeKey) {
    this.setState({ 
      activeKey: (activeKey === this.state.activeKey) ? -1 : activeKey
    });
  }

  render() {
    return (
      <PanelGroup activeKey={this.state.activeKey} onSelect={this.handleSelect} accordion>
        {Object.keys(this.props.tracks).map((genre, i) => {
          const iconType = (this.state.activeKey === i) ? 'menu-up' : 'menu-down';
          const header = <span>{genre} <Badge>{this.props.tracks[genre].length}</Badge> <Glyphicon glyph={iconType} className="pull-right" /></span>;
          return (
            <Panel header={header} eventKey={i}>
              <ButtonToolbar>
                <ButtonGroup>
                  <Button onClick={this.props.makePlaylist.bind(this, genre)}><Glyphicon glyph="save" /> Save Playlist</Button>
                  <Button onClick={this.props.clearGenre.bind(this, genre)}><Glyphicon glyph="trash" /> Clear</Button>
                </ButtonGroup>
              </ButtonToolbar>

              <br />

              <div>
                {this.props.tracks[genre].map((result, i) => {
                  if(!Object.keys(result).length) return;
                  return (
                    <SpotifyPlayer uri={result.track.uri} height={100} key={i} />
                  )
                })}
              </div>
            </Panel>
          );
        })}
      </PanelGroup>
    )
  }
}

export default TracksAccordion;

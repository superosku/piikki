import React from 'react';

import Popups from './misc/popups.jsx'


class Main extends React.Component {
  render() {
    return <div className="center-container">
      <Popups />
      {this.props.children}
    </div>
  }
}


export default Main;

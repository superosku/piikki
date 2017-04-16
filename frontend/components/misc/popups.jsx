import React from 'react';
import { connect } from 'react-redux';
import store from '../../store.js';


class Popup extends React.Component {
  render() {
    return <div
      className={`popup ${this.props.popup.class}`}
      onClick={this.removePopup.bind(this)}
    >
      <h1>
        {this.props.popup.class === 'success' && <i className="fa fa-check"></i>}
        {this.props.popup.class === 'error' && <i className="fa fa-ban"></i>}
        {this.props.popup.class === 'warning' && <i className="fa fa-exclamation-triangle"></i>}
        {this.props.popup.header}
      </h1>
      <p>
        {this.props.popup.info}
      </p>
    </div>
  }

  removePopup() {
    store.dispatch({
      type: 'REMOVE_POPUP',
      data: {id: this.props.popup.id}
    });
  }
}


class PopupsContainer extends React.Component {
  render() {
    return <div className="popup-container">
      {this.props.popups.map((popup) => <Popup key={popup.id} popup={popup} />)}
    </div>
  }
}


export default connect(
  function(store) {
    return {
      popups: store.popupsState.popups
    };
  }
)(PopupsContainer);

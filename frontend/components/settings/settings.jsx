import React from 'react';
import { connect } from 'react-redux';
import { authGet } from './../../api.js';
import store from './../../store.js';
import Spinner from './../misc/spinner.jsx';
import TabItem from './../add-tab/tab-item.jsx';
import { Link } from 'react-router';


class Settings extends React.Component {
  render() {
    return <div className="container settings-container padded-container">
      <h2>Settings</h2>
      <ul className="settings-menu">
        <li><Link to={`/${this.props.currentTeam.slug}/settings/tab-types`} activeClassName="active">Tab types</Link></li>
        <li><Link to={`/${this.props.currentTeam.slug}/settings/persons`} activeClassName="active">Persons</Link></li>
        <li><Link to={`/${this.props.currentTeam.slug}/settings/users`} activeClassName="active">Users</Link></li>
        <li><Link to={`/${this.props.currentTeam.slug}/settings/personal`} activeClassName="active">Personal</Link></li>
      </ul>
      <div className="settings-data">
        {
          this.props.children ? this.props.children : <p>Choose settings</p>
        }
      </div>
    </div>
  }
}


export default connect(function(store) {
  return {
    currentTeam: store.teamState.currentTeam
  }
})(Settings);

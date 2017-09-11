import React from 'react';
import { connect } from 'react-redux';
import store from './../store.js';
import { authGet } from './../api.js'
import Spinner from './misc/spinner.jsx';
import MainMenu from './main-menu.jsx'
import { logout } from '../services';


class LoggedIn extends React.Component {
  render() {
    return this.props.teamState.loaded ? <div className="center">
      <div className="title-container">
        <h1>{this.mainTitle}</h1>
      </div>
      <MainMenu
        logout={this.logout.bind(this)}
        slug={this.props.slug}
      ></MainMenu>
      <div className="content">
        {this.props.children}
      </div>
    </div> : <Spinner />
  }

  get mainTitle() {
    return (
      this.props.teamState.currentTeam ?
      this.props.teamState.currentTeam.name :
      'Tab manager'
    );
  }

  logout(event) {
    event.preventDefault();
    logout()
  }
}

class LoggedInContainer extends React.Component {
  componentDidMount() {
    authGet('/teams').then(response => {
      store.dispatch({
        type: 'SET_TEAMS',
        data: response.data
      });
    }).catch(error => {
      if (!error.response) {
        console.debug('ERROR SHOULDNT HAPPEN', error)
      }
      if (error.response.status == 401) {
        logout()
      }
    });
  }

  render() {
    return <LoggedIn
      teamState={this.props.teamState}
      slug={this.props.params.slug}
      children={this.props.children}
    ></LoggedIn>
  }
}

export default connect(
  function(store) {
    return {
      teamState: store.teamState,
      authenticated: store.authState.authenticated
    };
  }
)(LoggedInContainer);

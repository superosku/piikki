import React from 'react';
import { connect } from 'react-redux';
import store from './../store.js';
import { hashHistory, Link } from 'react-router';
import { authGet } from './../api.js'
import Spinner from './misc/spinner.jsx';
import MainMenu from './main-menu.jsx';
import { logout } from './../services.js';


class MainLayout extends React.Component {
  render() {
    return this.props.teamState.loaded ? <div>
      <h1>{this.teamState.currentTeam.name} - tabs</h1>
      <MainMenu
        logout={this.props.logout}
        slug={this.props.slug}
      ></MainMenu>
      <div>
        {this.props.children}
      </div>
    </div> : <Spinner />
  }

  logout() {
    logout()
  }

  getTeamLink(team) {
    const asdf = "/" + team.slug;
    return <Link to={asdf}>{team.name}</Link>
  }
}

class MainLayoutContainer extends React.Component {
  componentDidMount() {
    if (!this.props.access_token) {
      hashHistory.push('/login');
      return
    }
    authGet('/teams').then(response => {
      store.dispatch({
        type: 'SET_TEAMS',
        data: response.data
      });
    }).catch(error => {
      if (error.response.status == 401) {
        logout()
      }
    });
  }

  render() {
    return <MainLayout
      teamState={this.props.teamState}
      slug={this.props.params.slug}
      children={this.props.children}
    ></MainLayout>
  }
}

export default connect(
  function(store) {
    return {
      teamState: store.teamState,
      authenticated: store.authState.authenticated
    };
  }
)(MainLayoutContainer);

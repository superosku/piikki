import React from 'react';
import { connect } from 'react-redux';
import store from './../store.js';
import axios from 'axios';
import { Router, Route, IndexRoute, hashHistory, Link } from 'react-router';
import { authGet } from './../api.js'
import Spinner from './misc/spinner.jsx';

function logout() {
  localStorage.setItem('access_token', undefined);
  store.dispatch({
    type: 'AUTH_LOGOUT'
  });
  hashHistory.push('/login');
}

class UnderTeam extends React.Component {
  render() {
    return this.statesLoaded ? this.props.children : <Spinner />
  }

  get statesLoaded() {
    return (
      this.props.teamState.loaded &&
      this.props.tabTypeState.loaded &&
      this.props.personState.loaded &&
      this.props.teamState.currentTeam
    )
  }

  get currentTeam() {
    return this.props.teamState.teams.find(
      team => team.slug == this.props.teamSlug
    )
  }
}


class UnderTeamContainer extends React.Component {
  render() {
    return <UnderTeam
      teamState={this.props.teamState}
      personState={this.props.personState}
      tabTypeState={this.props.tabTypeState}
      teamSlug={this.props.params.slug}
      children={this.props.children}
    ></UnderTeam>
  }

  componentWillUnmount() {
    store.dispatch({
      type: 'UNSET_TEAM'
    });
  }

  componentWillMount() {
    this.loadTeamData(this.props.params.slug)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.params.slug && (this.props.params.slug != nextProps.params.slug)) {
      store.dispatch({
        type: 'UNSET_TEAM'
      });
      this.loadTeamData(nextProps.params.slug);
    }
  }

  loadTeamData(slug) {
    const tabTypeUrl = `/teams/${slug}/tab-types`;
    authGet(tabTypeUrl).then(response => {
      store.dispatch({
        type: 'SET_TAB_TYPES',
        data: response.data
      })
    });

    const personsUrl = `/teams/${slug}/persons`;
    authGet(personsUrl).then(response => {
      store.dispatch({
        type: 'SET_PERSONS',
        data: response.data
      })
    });

    const currentTeam = this.props.teamState.teams.find(team => team.slug == slug);
    store.dispatch({
      type: 'SET_CURRENT_TEAM',
      team: currentTeam
    })
  }
}


export default connect(
  function(store) {
    return {
      teamState: store.teamState,
      personState: store.personState,
      tabTypeState: store.tabTypeState
    };
  }
)(UnderTeamContainer);

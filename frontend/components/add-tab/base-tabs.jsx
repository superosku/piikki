import React from 'react';
import { connect } from 'react-redux';
import store from './../../store.js';
import MainLayoutContainer from './../main-layout.jsx'
import { Router, Route, IndexRoute, hashHistory, Link } from 'react-router';
import { authGet } from '../../api.js'
import PersonListing from './person-listing.jsx'
import Spinner from './../misc/spinner.jsx'


class BaseTabs extends React.Component {
  render() {
    return this.props.children;
  }

  componentDidMount() {
    console.debug('base tabs did mount');

    // TODO: this is copypasted, make sure to refactor it somewhere.
    const personsUrl = `/teams/${this.props.slug}/persons`;
    authGet(personsUrl).then(response => {
      store.dispatch({
        type: 'SET_PERSONS',
        data: response.data
      })
    });
  }
}

export default connect(
  function(store) {
    return {
      slug: store.teamState.currentTeam.slug
    }
  }
)(BaseTabs);

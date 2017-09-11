import React from 'react';
import { connect } from 'react-redux';
import store from './../../store.js';
import { authGet } from '../../api.js'


class BaseTabs extends React.Component {
  render() {
    return this.props.children;
  }

  componentDidMount() {
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

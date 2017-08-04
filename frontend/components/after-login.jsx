import React from 'react';
import { connect } from 'react-redux';
import store from './../store.js';
import { hashHistory } from 'react-router';
import { authGet } from './../api.js'
import Spinner from './misc/spinner.jsx';

class AfterLogin extends React.Component {
  componentDidMount() {
    authGet('/teams').then(response => {
      store.dispatch({
        type: 'SET_TEAMS',
        data: response.data
      });
      if (response.data.length === 1) {
        store.dispatch({
          type: 'SET_CURRENT_TEAM',
          data: response.data[0]
        });
        hashHistory.push('/' + response.data[0].slug + '/tab');
      } else {
        hashHistory.push('/choose');
      }
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
    return <Spinner />
  }
}

export default connect(
  function(store) {
    return {
      teamState: store.teamState,
      authenticated: store.authState.authenticated
    };
  }
)(AfterLogin);

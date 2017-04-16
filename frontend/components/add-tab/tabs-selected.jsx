import React from 'react';
import { connect } from 'react-redux';
import store from './../../store.js';
import MainLayoutContainer from './../main-layout.jsx'
import { Router, Route, IndexRoute, hashHistory, Link } from 'react-router';
import { authGet } from '../../api.js'
import PersonListing from './person-listing.jsx'
import AddTab from './add-tab.jsx'
import Spinner from './../misc/spinner.jsx'


class TabsSelected extends React.Component {
  render() {
    return <div className="tab-container container">
      <PersonListing
        active={true}
      ></PersonListing>
      <AddTab
        personId ={this.props.params.personId}
      />
    </div>
  }
}


export default connect(
  function(store) {
    return {
      personState: store.personState,
      authenticated: store.authState.authenticated
    }
  }
)(TabsSelected)

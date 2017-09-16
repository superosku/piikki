import React from 'react';
import { connect } from 'react-redux';
import PersonListing from './person-listing.jsx'


class Tabs extends React.Component {
  render() {
    return <div className="tab-container container">
      <PersonListing
        active={false}
      ></PersonListing>
      <div className="add-tab active choose-person">
        <h2>Choose a person</h2>
        <p>You must choose a person who to add tabs to</p>
      </div>
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
)(Tabs)

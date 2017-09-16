import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import Spinner from './../misc/spinner.jsx';


class PersonListing extends React.Component {
  render() {
    return <div className={'person-listing' + (this.props.active ? ' active' : '')}>
      {this.props.currentTeam ?
        <ul>
          {
            this.props.persons.filter(
              person => !person.disabled

            ).map(person =>
              <li key={person.id}>
                <Link
                  to={`/${this.props.currentTeam.slug}/tab/${person.id}`}
                  activeClassName="active"
                >
                  <span>
                    {person.name}
                  </span>
                  <span>
                    <span className="depth">
                      {person.total_depth}€
                    </span>
                    <span className="arrow">
                      <i className="fa fa-chevron-right" />
                    </span>
                  </span>
                </Link>
              </li>
            )
          }
        </ul> : <Spinner />
      }
    </div>
  }
}


export default connect(
  function(store, ownProps) {
    return {
      persons: store.personState.persons,
      currentTeam: store.teamState.currentTeam
    }
  }
)(PersonListing)

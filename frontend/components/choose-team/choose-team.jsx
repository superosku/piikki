import React from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';


class ChooseOrg extends React.Component {
  render() {
    return <div className="container choose-team padded-container">
      {
        this.props.teamState.teams.length > 0 ?
          this.teamList :
          <div>
            <h2>You are not part of any team</h2>
            <p>You can ask existing teams admin to add you to his team or create your own.</p>
          </div>
      }
      <Link className="new-team" to="/create-team">Create new team</Link>
    </div>
  }

  get teamList() {
    return <div>
      {this.props.teamState.teams.map(team =>
        <div key={team.id} className="team-item">
          <Link to={`/${team.slug}/tab`}>
            <i className="fa fa-coffee"></i>
            <span>
              {team.name}
            </span>
          </Link>
        </div>
      /*
        <li key={team.id}>
          <Link to={`/${team.slug}/tab`}>
            <i className="fa fa-coffee"></i>
            <span>
              {team.name}
            </span>
          </Link>
        </li>
      */
      )}
    </div>
  }
}


export default connect(
  function(store) {
    return {
      teamState: store.teamState
    }
  }
)(ChooseOrg);


import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

class MainMenu extends React.Component {
  render() {
    return <div className="main-menu">
      <ul>
        {
          this.props.teamState.currentTeam &&
          <li><Link to={`/${this.props.slug}/tab`} activeClassName="active">
            <i className="fa fa-beer"/>
            <span>
              Tabs
            </span>
          </Link></li>
        }
        {
          this.props.teamState.currentTeam &&
          <li><Link to={`/${this.props.slug}/log`} activeClassName="active">
            <i className="fa fa-list"/>
            <span>
              Log
            </span>
          </Link></li>
        }
        {
          this.props.teamState.currentTeam &&
          <li><Link to={`/${this.props.slug}/settings`} activeClassName="active">
            <i className="fa fa-cog"/>
            <span>
              Settings
            </span>
          </Link></li>
        }
        <li className="menu-button">
          <a
            className={(this.props.menuOpen ? 'active' : '')}
            onClick={this.props.toggleMenu}
            href="#"
          >
            <i className="fa fa-chevron-down"/>
            <span>
              {
                //this.props.teamState.currentTeam ?
                //this.props.teamState.currentTeam.name :
                'Menu'
              }
            </span>
          </a>
        </li>
        <ul className={'dropdown-menu' + (this.props.menuOpen ? '' : ' closed')}>
          {/*
          {this.props.teamState.teams.map(team =>
            <li key={team.id}>
              <Link onClick={this.props.closeMenu} to={`/${team.slug}/tab`}>
                <i className="fa fa-coffee"/>
                <span>
                  {team.name}
                </span>
              </Link>
            </li>
          )}
          */}
          <li>
            <Link to="choose" activeClassName="active" onClick={this.props.closeMenu}>
              <i className="fa fa-globe"/>
              <span>Teams</span>
            </Link>
          </li>
          <li>
            <a className="logout-link" onClick={this.props.logout}>
              <i className="fa fa-sign-out"/>
              <span>Logout</span>
            </a>
          </li>
        </ul>
      </ul>
    </div>
  }
}

class MainMenuContainer extends React.Component {
  constructor() {
    super();
    this.state = {
      menuOpen: false
    };
  }

  closeMenu() {
    this.setState({
      menuOpen: false
    });
  }

  toggleMenu(event) {
    this.setState({
      menuOpen: !this.state.menuOpen
    });
    event.preventDefault();
  }

  render() {
    return <MainMenu
      logout={this.props.logout}
      slug={this.props.slug}
      teamState={this.props.teamState}
      toggleMenu={this.toggleMenu.bind(this)}
      closeMenu={this.closeMenu.bind(this)}
      menuOpen={this.state.menuOpen}
    ></MainMenu>
  }
}


export default connect(
  function(store) {
    return {
      teamState: store.teamState
    }
  }
)(MainMenuContainer);

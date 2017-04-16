import React from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { hashHistory } from 'react-router';

import { authPost } from '../../api.js';
import store from '../../store.js';
import { showPopup, showError, showFormValidationError } from '../../popups.js';
import Spinner from './../misc/spinner.jsx';


class CreateTeam extends React.Component {
  render() {
    return <div className="container padded-container">
      <h2>Create team</h2>
      <form className="basic-form" onSubmit={this.props.submit}>
        <label>Name</label>
        <div className="input-container">
          <i className="fa fa-users" />
          <input
            required
            minLength="2"
            maxLength="15"
            type="text"
            value={this.props.name}
            onChange={this.props.setName}
          />
        </div>
        {
          this.props.loading ? <Spinner /> : <div>
            <button type="submit">Create</button>
            <Link to="choose">back</Link>
          </div>
        }
      </form>
    </div>
  }
}


class CreateTeamContainer extends React.Component {
  constructor() {
    super();
    this.state = {
      name: '',
      loading: false
    }
  };

  render() {
    return <CreateTeam
      name={this.state.name}
      setName={this.setName.bind(this)}
      submit={this.submit.bind(this)}
      loading={this.state.loading}
    ></CreateTeam>
  }

  setName(event) {
    this.setState({
      name: event.target.value
    })
  }

  submit(event) {
    event.preventDefault();
    const data = {
      name: this.state.name
    };
    this.setState({loading: true})
    authPost(
      '/teams',
      data
    ).then(response => {
      this.setState({loading: false})
      showPopup({
        'header': "Team created",
        'info': 'Your team has been created.',
        'class': 'success'
      });
      store.dispatch({
        type: 'SET_TEAMS',
        data: response.data
      });
      hashHistory.push('/choose');
    }).catch(error => {
      if (error.response && error.response.status === 400) {
        this.setState({loading: false})
        showFormValidationError(error.response.data);
      } else {
        showError();
      }
    });
  }
}


export default CreateTeamContainer;

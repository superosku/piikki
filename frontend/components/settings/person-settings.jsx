import React from 'react';
import { connect } from 'react-redux';
import { authPost, authPut } from './../../api.js';
import store from './../../store.js';
import Spinner from './../misc/spinner.jsx';

import { showPopup, showError, showFormValidationError } from '../../popups.js';


class PersonItem extends React.Component {
  constructor() {
    super();
    this.state = {deleting: false}
  }

  render() {
    return <tr>
      <td>{this.props.person.name}</td>
      <td>{this.props.person.total_depth}€</td>
      <td>
        {
          this.state.deleting ?
          <Spinner /> :
          <a className={this.props.person.disabled ? 'enable-person' : 'disable-person'}
            onClick={(event) => {
            this.props.disablePerson(
              event,
              this.props.person.id,
              {disabled: !this.props.person.disabled}
            );
            this.setState({deleting: true});
          }}>
            {
              this.props.person.disabled ?
                'Enable' :
                'Disable'
            }
          </a>
        }
      </td>
    </tr>
    return <div className="person-item settings-item">
      <p>
        <span> {this.props.person.name}, owns: {this.props.person.total_depth}€, </span>
      </p>
    </div>
  }
}


class PersonSettings extends React.Component {
  constructor() {
    super();
    this.state = {
      name: ''
    }
  }

  render() {
    return <div className="person-settings">
      <p>
        Here you can edit your teams persons.
      </p>
      <ul>
        <li>You can add new persons or disable/enable old ones.</li>
        <li>Persons are such who can have tabs added for them.</li>
        <li>Persons cannot log in to the service.</li>
        <li>If you want to invite users to log in to your team, you must do it under users tab.</li>
      </ul>
      {this.currentPersons()}
      {this.disabledPersons()}
      {this.addNewPersonForm()}
    </div>
  }

  currentPersons() {
    return <div>
      <h3>Current persons</h3>
      <table>
        <tbody>
          <tr>
            <th>Name</th>
            <th>Owns</th>
            <th>Action</th>
          </tr>
          {
            this.props.personState.persons.filter(
              person => !person.disabled
            ).map(
              person => <PersonItem
                key={person.id}
                person={person}
                disablePerson={this.props.disablePerson}
              ></PersonItem>
            )
          }
        </tbody>
      </table>
    </div>
  }

  disabledPersons() {
    return <div>
      <h3>Disabled persons</h3>
      <table>
        <tbody>
          {
            this.props.personState.persons.filter(
              person => person.disabled
            ).map(
              person => <PersonItem
                key={person.id}
                person={person}
                disablePerson={this.props.disablePerson}
              ></PersonItem>
            )
          }
        </tbody>
      </table>
    </div>
  }

  addNewPersonForm() {
    return <div>
      <h3>Add new</h3>
      <form
        className="basic-form"
        onSubmit={(event) => {this.props.createPerson(event, this.state)}}
      >
        <label>Name</label>
        <div className="input-container">
          <input
            required
            id="name"
            minLength="2"
            type="text"
            value={this.state.name}
            onChange={((event) => {this.setState({name: event.target.value})}).bind(this)}
          />
          <i className="fa fa-user" />
        </div>
        {
          this.props.submitting ? <Spinner /> : <div>
            <button
              type="submit"
            >Add</button>
          </div>
        }
      </form>
    </div>
  }
}


class PersonSettingsContainer extends React.Component {
  constructor() {
    super();
    this.state = {submitting: false}
  }

  render() {
    return <PersonSettings
      personState={this.props.personState}
      disablePerson={this.disablePerson.bind(this)}
      createPerson={this.createPerson.bind(this)}
      submitting={this.state.submitting}
    ></PersonSettings>
  }

  disablePerson(event, personId, data) {
    event.preventDefault();
    const url = `/teams/${this.props.currentTeam.slug}/persons/${personId}`;
    authPut(url, data).then((response) => {
      store.dispatch({
        type: 'SET_PERSONS',
        data: response.data
      });
      showPopup({
        'header': 'Person settings changed',
        'info': 'Succesfully.',
        'class': 'success'
      });
    }).catch(error => {
      if (error.response && error.response.status === 400) {
        this.setState({submitting: false});
        showFormValidationError(error.response.data);
      } else {
        showError();
      }
    });
  }

  createPerson(event, data) {
    event.preventDefault();
    const url = `/teams/${this.props.currentTeam.slug}/persons`;
    this.setState({submitting: true});
    authPost(url, data).then((response) => {
      this.setState({submitting: false});
      store.dispatch({
        type: 'SET_PERSONS',
        data: response.data
      });
      showPopup({
        'header': 'Person added',
        'info': 'Succesfully.',
        'class': 'success'
      });
    }).catch(error => {
      if (error.response && error.response.status === 400) {
        this.setState({submitting: false});
        showFormValidationError(error.response.data);
      } else {
        showError();
      }
    });
  }
}


export default connect(function(store) {
  return {
    personState: store.personState,
    currentTeam: store.teamState.currentTeam
  }
})(PersonSettingsContainer);

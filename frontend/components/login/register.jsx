import React from 'react';
import { connect } from 'react-redux';
import { Link, hashHistory } from 'react-router';
import axios from 'axios';

import { showPopup, showError, showFormValidationError } from '../../popups.js';


class Register extends React.Component {
  render() {
    return <div className="login-center">
      <div className="login-vertical-center">
        <div className="login-container">
          <h2>Register</h2>
          <form className="basic-form register-form" onSubmit={this.props.register}>
            <label>Email</label>
            <div className="input-container">
              <i className="fa fa-at" />
              <input
                required
                id="email"
                type="email"
                value={this.props.email}
                onChange={this.props.setEmail}
              />
            </div>
            <label>Password</label>
            <div className="input-container">
              <i className="fa fa-unlock-alt" />
              <input
                required
                id="password"
                type="password"
                minLength="6"
                value={this.props.password}
                onChange={this.props.setPassword}
              />
            </div>
            <label>First name</label>
            <div className="input-container">
              <i className="fa fa-user" />
              <input
                required
                id="first-name"
                type="text"
                minLength="2"
                value={this.props.firstName}
                onChange={this.props.setFirstName}
              />
            </div>
            <label>Last name</label>
            <div className="input-container">
              <i className="fa fa-user" />
              <input
                required
                id="last-name"
                type="text"
                minLength="2"
                value={this.props.lastName}
                onChange={this.props.setLastName}
              />
            </div>
            <div className="bottom-part">
              <button type="submit">Register</button>
              <Link to="/login">login</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  }
}


class RegisterContainer extends React.Component {
  constructor() {
    super();
    this.state = {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      submitting: false
    }
  }

  render() {
    return <Register
      email={this.state.email}
      setEmail={this.setEmail.bind(this)}
      password={this.state.password}
      setPassword={this.setPassword.bind(this)}
      lastName={this.state.lastName}
      setLastName={this.setLastName.bind(this)}
      firstName={this.state.firstName}
      setFirstName={this.setFirstName.bind(this)}
      register={this.register.bind(this)}
    ></Register>
  }

  setEmail(event) {
    this.setState({
      email: event.target.value
    });
  }

  setPassword(event) {
    this.setState({
      password: event.target.value
    });
  }

  setFirstName(event) {
    this.setState({
      firstName: event.target.value
    });
  }

  setLastName(event) {
    this.setState({
      lastName: event.target.value
    });
  }

  register(event) {
    event.preventDefault();
    this.setState({submitting: true});
    const data = {
      email: this.state.email,
      password: this.state.password,
      first_name: this.state.firstName,
      last_name: this.state.lastName
    };
    const url = `${API_URL}/register`;
    axios.post(url, data).then(() => {
      this.setState({submitting: false});
      showPopup({
        'header': 'Registered succesfully',
        'info': 'You have registered succesfully. You can now log in with the credentials you provided.',
        'class': 'success'
      }, 10000);
      hashHistory.push('/login');
    }).catch((error) => {
      if (error.response && error.response.status === 400) {
        this.setState({submitting: false});
        showFormValidationError(error.response.data);
      } else {
        showError();
      }
    });
  }
}


export default RegisterContainer;

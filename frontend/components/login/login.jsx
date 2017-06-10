import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { connect, Provider } from 'react-redux';
import { Router, Route, IndexRoute, hashHistory, Link } from 'react-router';

import store from './../../store.js';
import MainLayoutContainer from './../main-layout.jsx'
import Spinner from './../misc/spinner.jsx';

import { showPopup, showError } from '../../popups.js';


class Login extends React.Component {
  render() {
    return <div className="login-center">
      <div className="login-vertical-center">
        <div className="login-container">
          <h2>Login</h2>
          <form className="basic-form" onSubmit={this.login.bind(this)}>
            <label>Email</label>
            <div className="input-container">
              <i className="fa fa-at" />
              <input
                required
                placeholder="Email"
                type="text"
                id="email"
                value={this.state.email}
                onChange={(event) => {this.setState({email: event.target.value})}}
              />
            </div>
            <label>Password</label>
            <div className="input-container">
              <i className="fa fa-unlock-alt" />
              <input
                required
                placeholder="Password"
                type="password"
                id="password"
                value={this.state.password}
                onChange={(event) => {this.setState({password: event.target.value})}}
              />
            </div>
            <div className="bottom-part">
              {
                this.state.loading ?
                  <Spinner /> :
                  (
                    <div>
                      <button type="submit" className="login-button">Login</button>
                      <Link to="/register">register</Link>
                    </div>
                  )
              }
            </div>
          </form>
        </div>
      </div>
    </div>
  }


  login(e) {
    e.preventDefault();
    const url = `${API_URL}/auth`;
    const data = {
      username: this.state.email,
      password: this.state.password
    };
    this.setState({
      loading: true
    });
    axios.post(url, data).then(response => {
      store.dispatch({
        type: 'AUTH_SUCCESS',
        data: response.data.access_token
      });
      localStorage.setItem('access_token', response.data.access_token);
      hashHistory.push('/choose');
    }).catch(error => {
      this.setState({
        loading: false
      });
      if (
        error.response &&
        error.response.status === 401 &&
        error.response.data.description == 'Invalid credentials'
      ) {
        showPopup({
          'header': "Invalid credentials",
          'info': 'Your credentials did not match or you have not registered yet.',
          'class': 'warning'
        });
      } else {
        showError();
      }
    });
  }

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      password: '',
      email: ''
    };
  }
}

export default Login

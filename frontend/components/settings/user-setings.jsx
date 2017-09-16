import React from 'react';
import { connect } from 'react-redux';
import { authGet, authPost } from './../../api.js';
import store from './../../store.js';
import Spinner from './../misc/spinner.jsx';
import TabItem from './../add-tab/tab-item.jsx';
import { Link } from 'react-router';
import { showError, showFormValidationError, showPopup } from '../../popups';


class UserInviteForm extends React.Component {
  render() {
    return <div>
      <form className="basic-form" onSubmit={this.props.submitForm}>
        <label>Email</label>
        <div className="input-container">
          <input
            required
            id="email"
            type="email"
            value={this.props.formData.email}
            onChange={((event) => {this.props.updateFormData('email', event.target.value)})}
          />
          <i className="fa fa-user" />
        </div>
        <label>Type</label>
        <select onChange={((event) => {this.props.updateFormData('type', event.target.value)})}>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        { this.props.submitting ?
            <Spinner /> :
            <div><button type="submit">Invite</button></div> }
      </form>
    </div>
  }
}


class UserListing extends React.Component {
  render() {
    return <div>
      {
        this.props.loading ?
          <Spinner /> :
          <table><tbody>
            <tr><th>Email</th><th>User</th><th>Admin</th><th>Edit</th></tr>
            {this.props.users.map(user => <tr key={user.id}>
              <td>{user.email}</td>
                <td> {
                  user.is_admin ?
                    <i className="fa fa-square-o" /> :
                    <i className="fa fa-check-square-o" />
                } </td>
                <td> {
                  user.is_admin ?
                    <i className="fa fa-check-square-o" /> :
                  <i className="fa fa-square-o" />
                } </td>
              <td></td>
              </tr>
            )}
          </tbody></table>
      }
    </div>
  }
}


class UserSettingsContainer extends React.Component {
  constructor() {
    super();
    this.state = {
      formData: {
        email: '',
        type: 'user'
      },
      submitting: false,
      users: [],
      loading: true
    }
  }

  render() {
    return <div className="user-settings">
      <p>
        Here you can invite new users
      </p>
      <ul>
        <li>Users can add tabs to your team.</li>
        <li>Admin users can edit your teams Tab types, Persons and Users.</li>
        <li>If you want to add tabs to users, you have to also add him as a person under Persons tab.</li>
      </ul>
      <h3>Users</h3>
      <UserListing
        users={this.state.users}
        loading={this.state.loading}
      />
      <h3>Invite</h3>
      <UserInviteForm
        formData={this.state.formData}
        submitting={this.state.submitting}
        updateFormData={this.updateFormData.bind(this)}
        submitForm={this.submitForm.bind(this)}
      />
    </div>
  }

  updateFormData(element, data) {
    var d = {};
    d[element] = data;
    this.setState({
      formData: Object.assign({}, this.state.formData, d)
    });
  }

  componentDidMount() {
    const url = `/teams/${this.props.teamSlug}/users`;
    authGet(url).then(response => {
      this.setState({
        users: response.data,
        loading: false
      });
    }).catch(() => {
      showError();
    });
  }

  submitForm(event) {
    event.preventDefault();
    const url = `/teams/${this.props.teamSlug}/users/invite`;
    const data = {
      email: this.state.formData.email,
      is_admin: this.state.formData.type === 'admin'
    };
    authPost(url, data).then(response => {
      showPopup({
        'header': "User invited",
        'info': 'This user has now been added to your team.',
        'class': 'success'
      });
      this.setState({
        submitting: false,
        users: response.data
      })
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
    teamSlug: store.teamState.currentTeam.slug
  }
})(UserSettingsContainer);

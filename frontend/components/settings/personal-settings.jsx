import React from 'react';
import { connect } from 'react-redux';
import { authGet, authPost } from './../../api.js';
import Spinner from './../misc/spinner.jsx';
import { showPopup, showError, showFormValidationError } from '../../popups.js';


class ChangePasswordForm extends React.Component {
  render() {
    return <form
      className="basic-form"
      onSubmit={this.props.changePassword}
    >
      <label>Current password</label>
      <div className="input-container">
        <input
          required
          type="password"
          value={this.props.formData.oldPassword}
          onChange={((event) => {this.props.updateFormData('oldPassword', event.target.value)})}
        />
        <i className="fa fa-lock" />
      </div>
      <label>New password</label>
      <div className="input-container">
        <input
          required
          type="password"
          minLength="6"
          value={this.props.formData.newPassword}
          onChange={((event) => {this.props.updateFormData('newPassword', event.target.value)})}
        />
        <i className="fa fa-unlock-alt" />
      </div>
      <label>New password again</label>
      <div className="input-container">
        <input
          required
          type="password"
          minLength="6"
          value={this.props.formData.newPassword2}
          onChange={((event) => {this.props.updateFormData('newPassword2', event.target.value)})}
        />
        <i className="fa fa-unlock-alt" />
      </div>
      {
        (this.props.formData.newPassword2 !== '' && (this.props.formData.newPassword !== this.props.formData.newPassword2)) ?
          <div className="error"><span>Passwords must match</span></div> :
          undefined
      }
      {
        this.props.submitting ? <Spinner /> : <div>
          <button
            type="submit"
          >Change</button>
        </div>
      }
    </form>
  }

}


class ChangePasswordFormContainer extends React.Component {
  constructor() {
    super();
    this.initialFormData = {
      oldPassword: '',
      newPassword: '',
      newPassword2: ''
    };
    this.state = {
      formData: {...this.initialFormData},
      submitting: false
    }
  }

  updateFormData(element, data) {
    var d = {};
    d[element] = data;
    this.setState({
      formData: Object.assign({}, this.state.formData, d)
    });
  }
  
  changePassword(event) {
    event.preventDefault();
    this.setState({submitting: true});
    const data = {
      current_password: this.state.formData.oldPassword,
      new_password: this.state.formData.newPassword
    };
    authPost('/change-password', data).then((response) => {
      showPopup({
        'header': "Password changed",
        'info': 'You have now succesfully changed your password.',
        'class': 'success'
      });
      this.setState({
        submitting: false,
        formData: {...this.initialFormData}
      });
    }).catch((error) => {
      if (error.response && error.response.status === 400) {
        showFormValidationError(error.response.data);
        this.setState({submitting: false});
      } else {
        showError();
      }
    });
  }

  render() {
    return <ChangePasswordForm
      formData={this.state.formData}
      updateFormData={this.updateFormData.bind(this)}
      changePassword={this.changePassword.bind(this)}
      submitting={this.state.submitting}
    ></ChangePasswordForm>
  }
}


class PersonalSettingsContainer extends React.Component {
  render() {
    return <div>
      <h3>Change password</h3>
      <ChangePasswordFormContainer />
    </div>
  }
}


export default connect(function(store) {
  return {
    //currentTeam: store.teamState.currentTeam
  }
})(PersonalSettingsContainer);

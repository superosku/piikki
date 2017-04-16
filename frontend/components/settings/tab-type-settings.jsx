import React from 'react';
import { connect } from 'react-redux';
import { authDelete, authPost } from './../../api.js';
import store from './../../store.js';
import Spinner from './../misc/spinner.jsx';
import TabItem from './../add-tab/tab-item.jsx';

import { showPopup, showError, showFormValidationError } from '../../popups.js';


class TabTypeItem extends React.Component {
  constructor() {
    super();
    this.state = {deleting: false}
  }

  render() {
    return <tr>
      <td>{this.props.tabType.name}</td>
      <td>{this.props.tabType.price}€</td>
      <td>
        {
          this.state.deleting ?
            <Spinner /> :
            <a
              onClick={(event) => {
            this.props.deleteTabType(event, this.props.tabType.id);
            this.setState({deleting: true});
          }}>
              Delete
            </a>
        }
      </td>
    </tr>
  }
}


class TabTypeSettings extends React.Component {
  constructor() {
    super();
    this.state = {
      name: '',
      price: ''
    }
  }

  render() {
    return <div>
      <p>Here you can create new tab types or delete old ones.</p>
      <h3>Current tap types</h3>
      <table>
        <tbody>
          <tr>
            <th>Name</th>
            <th>Price</th>
            <th>Action</th>
          </tr>
          {
            this.props.tabTypeState.tabTypes.map(
              tabType => <TabTypeItem
                key={tabType.id}
                tabType={tabType}
                deleteTabType={this.props.deleteTabType}
              ></TabTypeItem>
            )
          }
        </tbody>
      </table>
      <h3>Add new</h3>
      <form
        className="basic-form"
        onSubmit={(event) => {this.props.createTabType(event, this.state)}}
      >
        <label>Name</label>
        <div className="input-container">
          <i className="fa fa-beer" />
          <input
            required
            minLength="1"
            maxLength="20"
            type="text"
            value={this.state.name}
            onChange={((event) => {this.setState({name: event.target.value})}).bind(this)}
          />
        </div>
        <label>Price</label>
        <div className="input-container">
          <i className="fa fa-euro" />
          <input
            required
            type="number"
            max="999"
            min="-999"
            value={this.state.price}
            onChange={((event) => {this.setState({price: event.target.value})}).bind(this)}
          />
        </div>
        <div>
          {this.props.submitting ? <Spinner /> : <button type="submit">Add</button>}
        </div>
      </form>
    </div>
  }
}


class TabTypeSettingsContainer extends React.Component {
  constructor() {
    super();
    this.state = {submitting: false}
  }

  render() {
    return <TabTypeSettings
      tabTypeState={this.props.tabTypeState}
      deleteTabType={this.deleteTabType.bind(this)}
      createTabType={this.createTabType.bind(this)}
      submitting={this.state.submitting}
    ></TabTypeSettings>
  }

  deleteTabType(event, tabTypeId) {
    event.preventDefault();
    console.debug('JEE', tabTypeId);
    const url = `/teams/${this.props.currentTeam.slug}/tab-types/${tabTypeId}`;
    authDelete(url).then((response) => {
      store.dispatch({
        type: 'SET_TAB_TYPES',
        data: response.data
      });
      showPopup({
        'header': 'Tab type deleted',
        'info': 'Succesfully.',
        'class': 'success'
      });
    }).catch(() => {
      showError();
    });
  }

  createTabType(event, data) {
    event.preventDefault();
    console.debug('jee', data);
    const url = `/teams/${this.props.currentTeam.slug}/tab-types`;
    data.price = parseFloat(data.price);
    this.setState({submitting: true});
    authPost(url, data).then((response) => {
      this.setState({submitting: false});
      store.dispatch({
        type: 'SET_TAB_TYPES',
        data: response.data
      });
      showPopup({
        'header': 'Tab type added',
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
    tabTypeState: store.tabTypeState,
    currentTeam: store.teamState.currentTeam
  }
})(TabTypeSettingsContainer);

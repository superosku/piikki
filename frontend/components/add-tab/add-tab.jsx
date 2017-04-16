import React from 'react';
import { connect } from 'react-redux';
import store from './../../store.js';
import MainLayoutContainer from './../main-layout.jsx'
import { Router, Route, IndexRoute, hashHistory, Link } from 'react-router';
import { authPost, authGet } from '../../api.js';
import PersonListing from './person-listing.jsx';
import Spinner from './../misc/spinner.jsx';
import { showPopup, showError, showFormValidationError } from '../../popups.js';


class AddTab extends React.Component {
  render() {
    return <div className="add-tab">
      <h2>
        <Link to={`/${this.props.slug}/tab`} className="back-button">
          <i className="fa fa-chevron-left"/>
        </Link>
        {this.selectedPerson && this.selectedPerson.name}
      </h2>
      <form onSubmit={this.props.submitForm}>
        {Object.keys(this.props.formData).map(key => {
          const item = this.props.formData[key];
          return <div key={item.id} className="form-item">
            <span className="tab-type-name">
              {item.name} {item.price}€
            </span>
            <div className="amount-input">
              <button
                type="button"
                onClick={() => this.props.setValue(item.id, item.value - 1)}
              >-</button>
              <input
                type="number"
                step="1"
                max="9999"
                min="-9999"
                onChange={(event) => this.props.setValue(item.id, parseFloat(event.target.value))}
                value={item.value}
              />
              <button
                type="button"
                onClick={() => this.props.setValue(item.id, item.value + 1)}
              >+</button>
            </div>
          </div>
        })}
        <div className="form-item">
          <span className="tab-type-name other">
            Other
          </span>
          <span
            className={'tab-type-name-smaller' + (this.otherHasData ? '' : ' hidden')}
          >
            How much
          </span>
          <div className="other-input-container">
            <input
              className="other-input"
              type="number"
              max="9999"
              min="-9999"
              onChange={this.props.setOtherAmount}
              value={this.props.other.amount}
            />
          </div>
          <span
            className={'tab-type-name-smaller' + (this.otherHasData ? '' : ' hidden')}
          >
            What
          </span>
          <div className="other-input-container">
            <input
              className={'other-input' + (this.otherHasData ? '' : ' hidden')}
              type="text"
              onChange={this.props.setOtherName}
              value={this.props.other.name}
            />
          </div>
        </div>
        <div className="add-button-container">
          {
            this.props.sending ?
              <Spinner /> :
              <input className="submit-button" type="submit" value="Add" />
          }
        </div>
      </form>
    </div>
  }

  get selectedPerson() {
    return this.props.persons.find(
      person => person.id === parseInt(this.props.personId)
    );
  }

  get otherHasData() {
    return !(this.props.other.amount === '0' || !this.props.other.amount);
  }
}

class AddTabContainer extends React.Component {
  constructor() {
    super();
    this.state = {
      formData: {},
      other: {
        name: '',
        amount: 0
      },
      sending: false
    };
  }

  render() {
    return <AddTab
      persons={this.props.persons}
      tabTypeState={this.props.tabTypeState}
      personId={this.props.personId}
      formData={this.state.formData}
      other={this.state.other}
      setValue={this.setValue.bind(this)}
      submitForm={this.submitForm.bind(this)}
      slug={this.props.slug}
      setOtherAmount={this.setOtherAmount.bind(this)}
      setOtherName={this.setOtherName.bind(this)}
      sending={this.state.sending}
    ></AddTab>
  }

  setOtherAmount(event) {
    this.setState({
      other: {
        amount: event.target.value,
        name: this.state.other.name
      }
    });
  }

  setOtherName(event) {
    this.setState({
      other: {
        name: event.target.value,
        amount: this.state.other.amount
      }
    });
  }

  componentDidMount() {
    this.setInitialFormData();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.personId != nextProps.personId) {
      this.setInitialFormData();
    }
  }

  submitForm(event) {
    event.preventDefault();
    var tab_item_data = Object.keys(this.state.formData)
      .map(key => this.state.formData[key])
      .map(item => {return {
        name: item.name,
        amount: item.value,
        price: item.price
      }})
      .filter(item => item.amount != 0);


    if (this.state.other.amount) {
      var other_data = [{
        name: this.state.other.name,
        amount: 1,
        price: parseFloat(this.state.other.amount)
      }];
      tab_item_data = tab_item_data.concat(other_data);
    }

    if (tab_item_data.length === 0) {
      showPopup({
        'header': "Add items before submitting",
        'info': 'You have selected nothing to add.',
        'class': 'warning'
      });
      return;
    }

    var data = {
      tab_items: tab_item_data,
      person_id: parseInt(this.props.personId)
    };

    const url = `/teams/${this.props.slug}/tab-items`;
    this.setState({
      sending: true
    });
    authPost(url, data).then(response => {
      this.setInitialFormData();
      this.setState({sending: false});

      store.dispatch({
        type: 'SET_PERSONS',
        data: response.data.persons
      });

      showPopup({
        'header': "Tab's added",
        'info': 'Added tabs succesfully',
        'class': 'success'
      });

      hashHistory.push(`${this.props.slug}/tab`)
    }).catch(error => {
      if (error.response && error.response.status === 400) {
        this.setState({sending: false});
        showFormValidationError(error.response.data);
      } else {
        showError();
      }
    });
  }

  setValue(itemId, value) {
    value = isNaN(value) ? '' : Math.round(value * 100) / 100;
    if (value < 0) {
      value = 0;
    }
    var formData = this.state.formData;
    formData[itemId].value = value;
    this.setState({
      formData: formData
    });
  }

  setInitialFormData() {
    var data = {};
    this.props.tabTypeState.tabTypes.forEach(tabType => {
      data[tabType.id] = {
        name: tabType.name,
        id: tabType.id,
        price: tabType.price,
        value: 0
      }
    });
    this.setState({
      formData: data,
      other: {
        name: '',
        amount: 0
      },
      sending: false
    });
  }
}

export default connect(
  function(store) {
    return {
      persons: store.personState.persons,
      tabTypeState: store.tabTypeState,
      slug: store.teamState.currentTeam.slug
    }
  }
)(AddTabContainer);

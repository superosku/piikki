import React from 'react';
import moment from 'moment';

import { authDelete } from '../../api.js';
import { connect } from 'react-redux';
import { showError, showPopup } from '../../popups';


class TabItem extends React.Component {
  render() {
    return <div className="tab-item">
      <div className="tab-item-header">
        <div>
          <span className="blue-thing type-name">
            {this.props.tabItem.name}
          </span>
        </div>
        <div>
          <span className="blue-thing">{this.addedAt}</span>
        </div>
      </div>
      <div className="tab-item-content">
        <div className="info-container">
          <span className="name">
            <i className="fa fa-address-book"></i>
          </span>
          <span className="info">{this.props.tabItem.adder.name}</span>
        </div>
        <div className="info-container">
          <span className="name">
            <i className="fa fa-address-book-o"></i>
          </span>
          <span className="info">{this.props.tabItem.person.name}</span>
        </div>
        <div className="info-container">
          <span className="name">
            <i className="fa fa-money"></i>
          </span>
          <span className="info">{this.price}</span>
        </div>
        <div className="info-container delete">
          {this.props.tabItem.can_be_deleted && <button onClick={this.props.onDelete}>
            Delete
            <i className="fa fa-trash"></i>
          </button>}
        </div>
      </div>
    </div>
  }

  get addedAt() {
    return <span>
      <i className="fa fa-calendar"></i>
      {moment(this.props.tabItem.added_at).format('DD.MM.YY')}
      <i className="fa fa-clock-o"></i>
      {moment(this.props.tabItem.added_at).format('HH:mm')}
    </span>
    return moment(this.props.tabItem.added_at).format('DD.MM.YY - HH:mm');
  }

  get price() {
    if (this.props.tabItem.amount === 1) {
      return <span className="price-info">
        <span className="final-price">
          {this.props.tabItem.price}€
        </span>
      </span>
    }
    return <span className="price-info">
      {this.props.tabItem.price}€ x {this.props.tabItem.amount} = <span className="final-price">{this.props.tabItem.total}€</span>
    </span>;
  }
}


class TabItemContainer extends React.Component {
  render() {
    return <TabItem
      tabItem={this.props.tabItem}
      onDelete={this.onDelete.bind(this)}
    ></TabItem>
  }

  onDelete() {
    const url = (
      `/teams/${this.props.slug}` +
      `/tab-items/${this.props.tabItem.id}`
    );
    console.debug('deleted this', url);
    authDelete(url).then(() => {
      showPopup({
        header: 'Deleted',
        info: 'Tab item deleted',
        class: 'success'
      });
      this.props.refreshList();
    }).catch((error) => {
      if (error.response && error.response.status == 400) {
        showPopup({
          header: 'Error',
          info: error.response.data.errors.error[0],
          class: 'warning'
        });
      } else {
        showError();
      }
    })
  }
}


export default connect(
  function(store) {
    return {
      slug: store.teamState.currentTeam.slug
    }
  }
)(TabItemContainer);

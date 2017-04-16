import React from 'react';
import { connect } from 'react-redux';
import { authGet } from './../api.js';
import store from './../store.js';
import Spinner from './misc/spinner.jsx';
import TabItem from './add-tab/tab-item.jsx';

import { showError } from '../popups'


class Log extends React.Component {
  render() {
    return <div className="container log-container padded-container">
      <h2>Tab log</h2>
      <p className="log-count">{this.props.tabItemState.count} items.</p>
      {this.props.tabItemState.tabItems.map(
        tabItem => <TabItem
          key={tabItem.id}
          tabItem={tabItem}
        ></TabItem>)
      }
      <div className="log-end">
        {this.props.tabItemState.loading ?
          <Spinner /> :
          <div>
            {this.props.tabItemState.hasMore &&
            <button
              onClick={this.props.loadMore}
              className="load-more"
            >More...</button>
            }
          </div>
        }
      </div>
    </div>
  }
}


class LogContainer extends React.Component {
  render() {
    return <Log
      tabItemState={this.props.tabItemState}
      loadMore={this.loadMore.bind(this)}
    ></Log>
  }

  componentDidMount() {
    const url = (
      `/teams/${this.props.params.slug}/tab-items`
    );
    store.dispatch({
      type: 'SET_TAB_ITEM_LOADING'
    });
    authGet(url).then(response => {
      store.dispatch({
        type: 'SET_TAB_ITEM_DATA',
        data: response.data
      });
    }).catch(() => {
      showError();
    });
  }

  componentWillUnmount() {
    store.dispatch({
      type: 'REMOVE_TAB_ITEM_DATA'
    });
  }

  loadMore() {
    const url = (
      `/teams/` +
      `${this.props.params.slug}/tab-items` +
      `?page=${this.props.tabItemState.page + 1}`
    );
    store.dispatch({
      type: 'SET_TAB_ITEM_LOADING'
    });
    authGet(url).then(response => {
      store.dispatch({
        type: 'APPEND_TAB_ITEM_DATA',
        data: response.data
      });
    }).catch(() => {
      showError();
    });
  }
}


export default connect(function(store) {
  return {
    teamState: store.teamState,
    tabItemState: store.tabItemState
  }
})(LogContainer);

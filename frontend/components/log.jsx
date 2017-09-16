import React from 'react';
import { connect } from 'react-redux';
import { authGet } from './../api.js';
import Spinner from './misc/spinner.jsx';
import TabItem from './add-tab/tab-item.jsx';

import { showError } from '../popups'


class Log extends React.Component {
  render() {
    return <div className="container log-container padded-container">
      <h2>Tab log</h2>
      <div className="input-container">
        <input
          required
          type="text"
          id="email"
          value={this.props.search}
          onChange={(event) => {this.props.setSearch(event.target.value)}}
        />
        <i className="fa fa-search" />
      </div>
      <p className="log-count">{this.props.count} items.</p>
      {this.props.tabItems.map(
        tabItem => <TabItem
          key={tabItem.id}
          tabItem={tabItem}
          refreshList={this.props.refreshList}
        ></TabItem>)
      }
      <div className="log-end">
        {this.props.loading ?
          <Spinner /> :
          <div>
            {this.props.hasMore &&
            <button
              onClick={() => {this.props.loadMore()}}
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
      loadMore={this.loadMore.bind(this)}
      search={this.state.search}
      setSearch={this.setSearch.bind(this)}
      loading={this.state.loading}
      tabItems={this.state.tabItems}
      count={this.state.count}
      refreshList={this.refreshList.bind(this)}
      hasMore={this.state.hasMore}
    ></Log>
  }

  constructor() {
    super();
    this.state = {
      search: '',
      page: 0,
      tabItems: [],
      loading: true,
      count: 0,
      hasMore: false
    };
  }

  refreshList() {
    this.setState(Object.assign(this.state, {
      search: '',
      page: 0,
      tabItems: []
    }));
    this.loadMore(undefined, 0);
  }

  setSearch(search) {
    this.setState(Object.assign(this.state, {
      search: search,
      page: 0,
      tabItems: []
    }));

    this.loadMore(search, 0);
  }

  componentDidMount() {
    this.loadMore();
  }

  loadMore(search='', page=0) {
    search = search || this.state.search;
    page = page || this.state.page;

    let url = (
      `/teams/` +
      `${this.props.params.slug}/tab-items` +
      `?page=${page}`
    );
    if (search) {
      url += `&search=${search}`;
    }

    this.setState(Object.assign(this.state, {
      loading: true
    }));

    authGet(url).then((searchWas => {
      return (response => {
        if (searchWas === this.state.search) {
          this.setState(Object.assign(this.state, {
            loading: false,
            tabItems: this.state.tabItems.concat(response.data.data),
            hasMore: response.data.data.length > 0,
            count: response.data.meta.count,
            page: this.state.page + 1
          }));
        }
      });
    })(search)).catch(() => {
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

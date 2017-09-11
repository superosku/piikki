import { createStore, combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux';

// Tab items

const initialTabItems = {
  loading: false,
  tabItems: [],
  count: 0,
  page: 0,
  hasMore: true
};

const tabItemReducer = function(state = initialTabItems, action) {
  const maxItemsFromApi = 50;
  if (action.type === 'SET_TAB_ITEM_LOADING') {
    return {
      loading: true,
      tabItems: state.tabItems,
      count: state.count,
      page: state.page,
      hasMore: state.hasMore
    }
  }
  if (action.type === 'SET_TAB_ITEM_DATA') {
    return {
      loading: false,
      tabItems: action.data.data,
      count: action.data.meta.count,
      page: action.data.meta.page,
      hasMore: action.data.data.length == maxItemsFromApi
    }
  }
  if (action.type === 'APPEND_TAB_ITEM_DATA') {
    return {
      loading: false,
      tabItems: state.tabItems.concat(action.data.data).map(o => Object.assign({}, o)),
      count: action.data.meta.count,
      page: action.data.meta.page,
      hasMore: action.data.data.length == maxItemsFromApi
    }
  }
  if (action.type === 'REMOVE_TAB_ITEM_DATA') {
    return initialTabItems;
  }
  return state
};

// Teams

const initialTeams = {
  teams: [],
  loaded: false,
  currentTeam: undefined
};

const teamReducer = function(state = initialTeams, action) {
  if (action.type === 'SET_TEAMS') {
    return {
      teams: action.data,
      loaded: true,
      currentTeam: state.currentTeam
    };
  }
  if (action.type === 'SET_CURRENT_TEAM') {
    return {
      teams: state.teams,
      loaded: state.loaded,
      currentTeam: action.team
    };
  }
  if (action.type === 'UNSET_TEAM') {
    return {
      teams: state.teams,
      loaded: state.loaded,
      currentTeam: undefined
    };
  }
  return state;
};

// Persons

const initialPersons = {
  persons: [],
  loaded: false
};

const personReducer = function(state = initialPersons, action) {
  if (action.type === 'SET_PERSONS') {
    return {
      persons: action.data,
      loaded: true
    };
  }
  if (action.type === 'UNSET_TEAM') {
    return initialPersons
  }
  return state;
};

// TapTypes

const initialTapTypes = {
  tabTypes: [],
  loaded: false
};


const tabTypeReducer = function(state = initialTapTypes, action) {
  if (action.type === 'SET_TAB_TYPES') {
    return {
      tabTypes: action.data,
      loaded: true
    }
  }
  if (action.type === 'UNSET_TEAM') {
    return initialTapTypes
  }
  return state
};

// Auth

const initialAuth = {
  access_token: localStorage.getItem('access_token') || undefined
};

const authReducer = function(state = initialAuth, action) {
  if (action.type === 'AUTH_SUCCESS') {
    return {
      access_token: action.data
    }
  }
  if (action.type === 'AUTH_LOGOUT') {
    return {
      access_token: undefined
    }
  }
  return state
};

const initialPopups = {
  popups: []
};


const popupsReducer = function(state = initialPopups, action) {
  if (action.type === 'ADD_POPUP') {
    var newPopups = state.popups.map(popup => popup);
    newPopups.push(action.data.popup);
    return {
      popups: newPopups
    }
  }
  if (action.type === 'REMOVE_POPUP') {
    return {
      popups: state.popups.filter(
        popup => popup.id !== action.data.id
      )
    }
  }
  return state;
};


const store = createStore(combineReducers({
  teamState: teamReducer,
  personState: personReducer,
  authState: authReducer,
  tabTypeState: tabTypeReducer,
  tabItemState: tabItemReducer,
  popupsState: popupsReducer,
  routing: routerReducer
}));

export default store;

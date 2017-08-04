import React from 'react';
import ReactDOM from 'react-dom';
import { connect, Provider } from 'react-redux';
import store from './../store.js';
import { Router, Route, IndexRoute, hashHistory } from 'react-router';

import AfterLogin from './after-login.jsx';
import BaseTabs from './add-tab/base-tabs.jsx';
import ChooseOrg from './choose-team/choose-team.jsx';
import CreateTeam from './choose-team/create-team.jsx';
import Log from './log.jsx'
import LoggedInContainer from './logged-in.jsx';
import Login from './login/login.jsx';
import Main from './main.jsx';
import PersonSettings from './settings/person-settings.jsx';
import PersonalSettings from './settings/personal-settings.jsx';
import Register from './login/register.jsx';
import Settings from './settings/settings.jsx';
import TabTypeSettings from './settings/tab-type-settings.jsx';
import TabsContainer from './add-tab/tabs.jsx';
import TabsSelectedContainer from './add-tab/tabs-selected.jsx';
import UnderTeam from './under-team.jsx';
import UserSettings from './settings/user-setings.jsx';
import { syncHistoryWithStore } from 'react-router-redux';


const history = syncHistoryWithStore(hashHistory, store);

ReactDOM.render(
  <Provider store={store}>
    <Router history={history}>
      <Route path="/" component={Main}>
        <IndexRoute component={Login}/>
        <Route path="login" component={Login} />
        <Route path="register" component={Register} />
        <Route path="/" component={LoggedInContainer}>
          <Route path="after-login" component={AfterLogin} />
          <Route path="choose" component={ChooseOrg} />
          <Route path="create-team" component={CreateTeam} />
          <Route path=":slug" component={UnderTeam}>
            <Route path="tab" component={BaseTabs}>
              <IndexRoute component={TabsContainer}/>
              <Route path=":personId" component={TabsSelectedContainer}/>
            </Route>
            <Route path="log" component={Log} />
            <Route path="settings" component={Settings}>
              <Route path="tab-types" component={TabTypeSettings} />
              <Route path="persons" component={PersonSettings} />
              <Route path="users" component={UserSettings} />
              <Route path="personal" component={PersonalSettings} />
            </Route>
          </Route>
        </Route>
      </Route>
    </Router>
  </Provider>,
  document.getElementById('root')
);

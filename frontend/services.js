import store from './store.js';
import { hashHistory } from 'react-router';
import { showPopup } from './popups';


function logout() {
  localStorage.setItem('access_token', undefined);
  store.dispatch({
    type: 'AUTH_LOGOUT'
  });
  hashHistory.push('/login');
  showPopup({
    header: 'Logged out',
    info: 'You have been logged out.',
    class: 'success'
  });
}


export { logout };

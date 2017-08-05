import store from './store.js';


function showPopup(popup, duration=3000) {
  const id = Math.floor(Math.random() * 100000);
  popup.id = id;
  store.dispatch({
    type: 'ADD_POPUP',
    data: {popup: popup}
  });
  if (duration !== 0) {
    setTimeout(() => {
      store.dispatch({
        type: 'REMOVE_POPUP',
        data: {id: id}
      });
    }, duration)
  }
}

function showError() {
  showPopup({
    'header': "Error",
    'info': 'Unknown error happened.',
    'class': 'error'
  }, 0);
}

function showFormValidationError(data) {
  var errorStr = (
    Object
      .keys(data.errors)
      .map(key => key + ": " + data.errors[key])
      .join(', ')
  );
  showPopup({
    'header': 'Form did not validate',
    'info': errorStr,
    'class': 'warning'
  }, 10000);
}

export { showPopup, showError, showFormValidationError };

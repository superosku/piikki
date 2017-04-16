import axios from 'axios';

function authGet(url) {
  const token = localStorage.getItem('access_token');

  return axios.get(API_URL + url, {
    headers: {
      Authorization: 'JWT ' + token
    }
  })
}

function authPost(url, data) {
  const token = localStorage.getItem('access_token');

  return axios.post(API_URL + url, data, {
    headers: {
      Authorization: 'JWT ' + token
    }
  })
}

function authDelete(url) {
  const token = localStorage.getItem('access_token');

  return axios.delete(API_URL + url, {
    headers: {
      Authorization: 'JWT ' + token
    }
  })
}

function authPut(url, data) {
  const token = localStorage.getItem('access_token');

  return axios.put(API_URL + url, data, {
    headers: {
      Authorization: 'JWT ' + token
    }
  })
}

export { authGet, authPost, authDelete, authPut };

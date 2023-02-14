'use strict';

const request = async (url, options) => {
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
  };
  // const name = localStorage.getItem('name');
  // if (name) {
  //   headers['DDPTP-name'] = btoaencodeURIComponent(name); // 커스텀 헤더
  // }

  const response = await fetch(url, {
    headers,
    ...options,
  });

  if (!response.ok) {
    const error = new Error(response.statusText);
    error.status = response.status;
    error.response = response;
    throw error;
  }

  const json = await response.json();
  return json;
};

const requestPost = (url, data, config) =>
  request(url, {
    method: 'POST',
    body: JSON.stringify(data),
    ...config,
  });

const requestGet = (url, params, config) => {
  const query = new URLSearchParams(params).toString();
  return request(`${url}?${query}`, {
    method: 'GET',
    ...config,
  });
};

const requestPut = (url, data, config) =>
  request(url, {
    method: 'PUT',
    body: JSON.stringify(data),
    ...config,
  });

const requestDelete = (url, data, config) =>
  request(url, {
    method: 'DELETE',
    body: JSON.stringify(data),
    ...config,
  });

const secondToString = (second) => {
  const hh = Math.floor(second / 60 / 60)
    .toString()
    .padStart(2, '0');
  const mm = (Math.floor(second / 60) % 60).toString().padStart(2, '0');
  const ss = (second % 60).toString().padStart(2, '0');
  return hh === '00' ? `${mm}:${ss}` : `${hh}:${mm}:${ss}`;
};

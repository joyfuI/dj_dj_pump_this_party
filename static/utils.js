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
  const json = await response.json();

  if (!response.ok) {
    const message = json?.message?.replace(
      /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
      ''
    ); // ansi color code 제거
    const error = new Error(message ?? response.statusText);
    error.status = response.status;
    error.response = response;
    error.data = json;
    throw error;
  }

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

const alert = (message) => {
  const alertPlaceholder = document.getElementById('alertPlaceholder');
  const template = document.createElement('template');
  template.innerHTML = `<div class="toast align-items-center text-bg-primary border-0" role="alert" aria-live="assertive" aria-atomic="true">
  <div class="d-flex">
    <div class="toast-body">${message}</div>
    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
  </div>
</div>`;
  const content = template.content.firstChild;
  content.addEventListener('hidden.bs.toast', () => {
    alertPlaceholder.removeChild(content);
  });
  alertPlaceholder.append(content);
  const toast = new bootstrap.Toast(content);
  toast.show();
};

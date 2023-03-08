'use strict';

const request = async (url, options) => {
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
  };
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

const nodeArrayToFragment = (nodeArray) => {
  const fragment = document.createDocumentFragment();
  nodeArray.forEach((node) => {
    fragment.appendChild(node.cloneNode(true));
  });
  return fragment;
};

const alert = (message) => {
  const alertPlaceholder = document.getElementById('alertPlaceholder');
  const template = document.getElementById('alert-toast');
  const clone = template.content.firstElementChild.cloneNode(true);

  const toastBody = clone.querySelector('.toast-body');
  toastBody.textContent = message;

  clone.addEventListener('hidden.bs.toast', () => {
    alertPlaceholder.removeChild(clone);
  });
  alertPlaceholder.append(clone);
  const toast = new bootstrap.Toast(clone);
  toast.show();
};

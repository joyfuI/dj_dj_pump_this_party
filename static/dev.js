'use strict';

class DevController extends Stimulus.Controller {
  async requestApi({ currentTarget }) {
    let { method, url, body, target, ...dataset } = currentTarget.dataset;
    body = body?.replaceAll("'", '"');
    Object.entries(dataset).forEach(([key, value]) => {
      url = url?.replaceAll(`\${${key}}`, value);
      body = body?.replaceAll(`\${${key}}`, value);
    });
    body = body ? JSON.parse(body) : undefined;
    const result = await (() => {
      switch (method.toLowerCase()) {
        case 'post':
          return requestPost(url, body);

        case 'get':
          return requestGet(url, body);

        case 'put':
          return requestPut(url, body);

        case 'delete':
          return requestDelete(url, body);

        default:
          throw new Error('requestApi');
      }
    })();
    if (target) {
      const node = document.querySelector(target);
      if (node) {
        node.textContent = JSON.stringify(result, null, 2);
      }
    }
  }
}

(() => {
  stimulus.register('dev', DevController);
})();

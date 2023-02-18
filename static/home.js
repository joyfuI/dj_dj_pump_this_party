'use strict';

class HomeController extends Stimulus.Controller {
  static targets = [
    'url',
    'playlist',
    'progress',
    'playButton',
    'volume',
    'search',
    'result',
  ];
  static values = { refreshInterval: Number };

  connect() {
    // let name = localStorage.getItem('name');
    // if (!name) {
    //   name = prompt('이름을 입력해주세요. (플레이리스트 구별용)');
    //   localStorage.setItem('name', name);
    // }

    this.volumeTooltip = new bootstrap.Tooltip(this.volumeTarget, {
      placement: 'top',
      title: () => this.volumeTarget.value,
      animation: false,
    });

    this.visibilitychangeEventListener = this.handleVisibilitychange.bind(this);
    if (this.hasRefreshIntervalValue) {
      this.visibilitychangeEventListener();
      document.addEventListener(
        'visibilitychange',
        this.visibilitychangeEventListener
      );
    } else {
      this.getPlayer();
    }
  }

  disconnect() {
    document.removeEventListener(
      'visibilitychange',
      this.visibilitychangeEventListener
    );
  }

  handleVisibilitychange() {
    if (document.visibilityState === 'visible') {
      this.startRefreshing();
    } else {
      this.stopRefreshing();
    }
  }

  startRefreshing() {
    this.getPlayer();
    this.refreshTimer = setInterval(() => {
      this.getPlayer();
    }, this.refreshIntervalValue);
  }

  stopRefreshing() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
  }

  async getPlayer() {
    const { playlist, isPlaying, current, volume, position } = await requestGet(
      '/api/player'
    );
    const html = playlist.map(
      (item) => `<div class="card ${
        item.id === current ? `border-${isPlaying ? 'primary' : 'warning'}` : ''
      }">
  <div class="row g-0">
    <div class="col-md-2">
      <img class="img-fluid rounded-start" src="${item.thumbnail}">
    </div>
    <div class="col-md-7">
      <div class="card-body">
        <h5 class="card-title ${item.id === current ? 'fw-bolder' : ''}">
          <a href="${item.url}" target="_blank" rel="noreferrer">${
        item.title
      }</a>
        </h5>
        <p class="card-text">
          <small class="text-muted">${secondToString(item.duration)}</small>
        </p>
      </div>
    </div>
    <div class="col-md-3 p-3 align-self-center text-end">
      <div class="btn-group" role="group">
        <button class="btn btn-light" type="button" data-action="click->home#upItem" data-id="${
          item.id
        }">
          <i class="bi bi-chevron-up"></i>
        </button>
        <button class="btn btn-light" type="button" data-action="click->home#downItem" data-id="${
          item.id
        }">
          <i class="bi bi-chevron-down"></i>
        </button>
        <button class="btn btn-danger" type="button" data-action="click->home#deleteItem" data-id="${
          item.id
        }">
          <i class="bi bi-trash-fill"></i>
        </button>
      </div>
    </div>
  </div>
</div>`
    );
    this.playlistTarget.innerHTML = html.join('');
    this.progressTarget.style.width = `${position}%`;
    this.progressTarget.setAttribute('aria-valuenow', position);
    this.playButtonTarget.className = isPlaying
      ? 'bi bi-stop-fill'
      : 'bi bi-play-fill';
    this.volumeTarget.value = volume;
  }

  async postItem(e) {
    e.preventDefault();
    await requestPost('/api/item', {
      url: this.urlTarget.value,
    });
    this.getPlayer();
  }

  async deleteItem({ currentTarget }) {
    const { id } = currentTarget.dataset;
    await requestDelete(`/api/item/${id}`);
    this.getPlayer();
  }

  async upItem({ currentTarget }) {
    const { id } = currentTarget.dataset;
    await requestPut(`/api/item/${id}/up`);
    this.getPlayer();
  }

  async downItem({ currentTarget }) {
    const { id } = currentTarget.dataset;
    await requestPut(`/api/item/${id}/down`);
    this.getPlayer();
  }

  async putCommand({ currentTarget }) {
    const { cmd } = currentTarget.dataset;
    await requestPut(`/api/player/${cmd}`);
    this.getPlayer();
  }

  async putVolume({ currentTarget }) {
    const volume = parseInt(currentTarget.value, 10);
    await requestPut('/api/player/volume', { volume });
    this.volumeTooltip.setContent({ '.tooltip-inner': volume.toString() });
  }

  async getSearch(e) {
    e.preventDefault();
    const { result } = await requestGet('/api/search', {
      q: this.searchTarget.value,
    });
    const html = result.map(
      (item) => `<div class="card">
  <div class="row g-0">
    <div class="col-md-2">
      <img class="img-fluid rounded-start" src="${item.thumbnail}">
    </div>
    <div class="col-md-8">
      <div class="card-body">
        <h6 class="card-title">
          <a href="${item.url}" target="_blank" rel="noreferrer">${
        item.title
      }</a>
        </h6>
        <p class="card-text">
          <small class="text-muted">${secondToString(item.duration)}</small>
        </p>
      </div>
    </div>
    <div class="col-md-2 p-3 align-self-center text-end">
      <button class="btn btn-primary" type="button" data-action="click->home#postSearchItem" data-bs-dismiss="modal" data-url="${
        item.url
      }">
        <i class="bi bi-plus"></i>
      </button>
    </div>
  </div>
</div>`
    );
    this.resultTarget.innerHTML = html.join('');
  }

  async postSearchItem({ currentTarget }) {
    const { url } = currentTarget.dataset;
    await requestPost('/api/item', {
      url,
    });
    this.getPlayer();
  }
}

(() => {
  stimulus.register('home', HomeController);
})();

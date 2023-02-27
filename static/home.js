'use strict';

class HomeController extends Stimulus.Controller {
  static targets = [
    'url',
    'autoAdd',
    'playlist',
    'current',
    'progress',
    'playButton',
    'volume',
    'search',
    'searchResult',
    'chartResult',
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

  makeModalCard(item) {
    return `<div class="card">
  <div class="row g-0">
    <div class="col-2">
      <img class="img-fluid rounded-start" src="${item.thumbnail}">
    </div>
    <div class="col-8 align-self-center">
      <div class="card-body">
        <h6 class="card-title m-0">
          <a href="${item.url}" target="_blank" rel="noreferrer">${item.title}</a>
        </h6>
      </div>
    </div>
    <div class="col-auto px-3 align-self-center text-end">
      <button class="btn btn-primary" type="button" data-action="click->home#postItem" data-bs-dismiss="modal" data-url="${item.url}">
        <i class="bi bi-plus"></i>
      </button>
    </div>
  </div>
</div>`;
  }

  scrollIntoCurrent() {
    this.currentTarget.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }

  stopPropagation(e) {
    e.stopPropagation();
  }

  async getPlayer() {
    const { playlist, isPlaying, current, volume, position, isAutoAdd } =
      await requestGet('/api/player');
    const html = playlist.map(
      (item) => `<div class="card ${
        item.id === current ? `border-${isPlaying ? 'primary' : 'warning'}` : ''
      } ${item.id === current ? 'text-bg-light' : ''}" ${
        item.id === current ? 'data-home-target="current"' : ''
      }>
  <div class="row g-0">
    <div class="col-md-2">
      <img class="img-fluid rounded-start" src="${item.thumbnail}">
    </div>
    <div class="col-md-7 align-self-center">
      <div class="card-body">
        <h5 class="card-title ${item.id === current ? 'fw-bolder' : ''}">
          <a href="${item.url}" target="_blank" rel="noreferrer">${
        item.title
      }</a>
        </h5>
        <p class="card-text">
          <small class="text-muted">${secondToString(item.duration)}${
        item.extra === 'auto' ? ' | 자동재생' : ''
      }</small>
        </p>
      </div>
    </div>
    <div class="col-md-3 p-3 align-self-center text-end">
      <div class="btn-group" role="group">
        <button class="btn btn-light" type="button" data-action="click->home#putItemUp" data-id="${
          item.id
        }">
          <i class="bi bi-chevron-up"></i>
        </button>
        <button class="btn btn-light" type="button" data-action="click->home#putItemDown" data-id="${
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
    this.volumeTooltip.setContent({ '.tooltip-inner': volume.toString() });
    this.autoAddTarget.checked = isAutoAdd;
  }

  async postItem(e) {
    e.preventDefault();
    const url = e.currentTarget.dataset.url ?? this.urlTarget.value;
    await requestPost('/api/item', { url });
    this.getPlayer();
  }

  async deleteItem({ currentTarget }) {
    const { id } = currentTarget.dataset;
    await requestDelete(`/api/item/${id}`);
    this.getPlayer();
  }

  async putItemUp({ currentTarget }) {
    const { id } = currentTarget.dataset;
    await requestPut(`/api/item/${id}/up`);
    this.getPlayer();
  }

  async putItemDown({ currentTarget }) {
    const { id } = currentTarget.dataset;
    await requestPut(`/api/item/${id}/down`);
    this.getPlayer();
  }

  async deleteItems({ currentTarget }) {
    const { type } = currentTarget.dataset;
    await requestDelete('/api/items', { type });
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
    const html = result.map(this.makeModalCard);
    this.searchResultTarget.innerHTML = html.join('');
  }

  async getChart({ currentTarget }) {
    const { category } = currentTarget.dataset;
    this.chartResultTarget.innerHTML = '';
    const { result } = await requestGet(`/api/chart/${category}`);
    const html = result.map(this.makeModalCard);
    this.chartResultTarget.innerHTML = html.join('');
  }

  async putAutoAdd() {
    await requestPut('/api/player/autoadd');
  }
}

(() => {
  stimulus.register('home', HomeController);
})();

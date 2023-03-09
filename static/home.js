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

  makeCard(item, current, isPlaying) {
    const template = document.getElementById('item-card');
    const clone = template.content.firstElementChild.cloneNode(true);

    const card = clone;
    if (item.id === current) {
      // 선택된 곡
      card.classList.add(`border-${isPlaying ? 'primary' : 'warning'}`);
      card.classList.add('text-bg-light');
      card.dataset.homeTarget = 'current';
    }

    const img = clone.querySelector('img');
    img.src = item.thumbnail;

    const cardTitle = clone.querySelector('.card-title');
    if (item.id === current) {
      cardTitle.classList.add('fw-bolder');
    }

    const a = clone.querySelector('a[target="_blank"]');
    a.href = item.url;
    a.textContent = item.title;

    const cardText = clone.querySelector('.card-text > .text-muted');
    cardText.textContent = `${secondToString(item.duration)} | ${item.extra}`;

    const btnGroup = clone.querySelectorAll('.btn-group > button');
    btnGroup.forEach((button) => {
      button.dataset.id = item.id;
    });

    return clone;
  }

  makeModalCard(item) {
    const template = document.getElementById('modal-card');
    const clone = template.content.firstElementChild.cloneNode(true);

    const img = clone.querySelector('img');
    img.src = item.thumbnail;

    const a = clone.querySelector('a[target="_blank"]');
    a.href = item.url;
    a.textContent = item.title;

    const btnGroup = clone.querySelectorAll(
      '.btn-group button:not([data-bs-toggle="dropdown"])'
    );
    btnGroup.forEach((button) => {
      button.dataset.url = item.url;
    });

    return clone;
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
    const node = nodeArrayToFragment(
      playlist.map((item) => this.makeCard(item, current, isPlaying))
    );
    this.playlistTarget.replaceChildren(node);
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
    const { url: urlData, position } = e.currentTarget.dataset;

    try {
      const url = urlData ?? this.urlTarget.value;
      await requestPost('/api/item', { url, position });
    } catch (error) {
      alert(error.message);
    }

    this.getPlayer();
  }

  async postMix(e) {
    e.preventDefault();
    const { url: urlData } = e.currentTarget.dataset;

    try {
      const url = urlData ?? this.urlTarget.value;
      await requestPost('/api/mix', { url });
    } catch (error) {
      alert(error.message);
    }

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
    const node = nodeArrayToFragment(result.map(this.makeModalCard));
    this.searchResultTarget.replaceChildren(node);
  }

  async getChart({ currentTarget }) {
    const { category } = currentTarget.dataset;
    this.chartResultTarget.innerHTML = '';
    const { result } = await requestGet(`/api/chart/${category}`);
    const node = nodeArrayToFragment(result.map(this.makeModalCard));
    this.chartResultTarget.replaceChildren(node);
  }

  async putAutoAdd() {
    await requestPut('/api/player/autoadd');
  }
}

stimulus.register('home', HomeController);

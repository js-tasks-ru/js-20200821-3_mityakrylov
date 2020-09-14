import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  element;
  subElements = {
    header: null,
    body: null,
  };

  loadCount = 30;

  sort = {
    field: 'title',
    order: 'asc',
  }

  state = 'loading';

  defaultCellTemplate = (cellData) => {
    return `<div class="sortable-table__cell">${cellData}</div>`;
  };

  constructor(header, { url }) {
    this.header = header.map(column => {
      const { id, title, sortable, sortType = null, template = this.defaultCellTemplate } = column;

      return { id, title, sortable, sortType, template };
    });
    this.data = [];

    this.url = url;

    this.initializeRender();
    this.render();
  }

  initializeRender() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;

    this.subElements = this.getSubElements(this.element);
    this.initEventListeners();
  }

  changeState(newState) {
    this.element.classList.remove('sortable-table_loading', 'sortable-table_empty');
    if (['loading', 'empty'].includes(newState)) {
      this.element.classList.add(`sortable-table_${newState}`);
    }
    this.state = newState;
  }

  async render() {
    this.changeState('loading');
    await this.sortOnServer(this.sort.field, this.sort.order);

    if (this.data) {
      const allColumns = this.element.querySelectorAll('.sortable-table__cell[data-id]');
      const currentColumn = this.element.querySelector(`.sortable-table__cell[data-id="${this.sort.field}"]`);

      // Set sorting arrow
      allColumns.forEach(column => {
        column.dataset.order = '';
      });
      currentColumn.dataset.order = this.sort.order;

      this.subElements.body.innerHTML = this.getDataTemplate(this.data);

      this.changeState('ready');

    } else {

      this.changeState('empty');
    }
  }

  async sortOnServer(field, order) {
    const url = this.getUrl({
      _sort: field,
      _order: order,
      _start: 0,
      _end: this.loadCount,
    });

    try {
      this.data = await fetchJson(url);
    } catch {
      this.data = [];
    }
  }

  getUrl(params) {
    const queryParams = Object.entries(params)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');

    return `${BACKEND_URL}/${this.url}${queryParams ? `?${queryParams}` : ''}`;
  }

  getTemplate() {
    return `
      <div class="sortable-table">
        <div data-element="header" class="sortable-table__header sortable-table__row">
        ${this.getHeaderTemplate()}
        </div>
        <div data-element="body" class="sortable-table__body">
        ${this.getDataTemplate(this.data)}
        </div>
        <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
        <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
          <div>Нет данных</div>
        </div>
    `;
  }

  getHeaderTemplate() {
    const headerHtml = this.header.map(column => {
      return `
        <div class="sortable-table__cell" data-id="${column.id}" data-sortable="${column.sortable}">
          <span>${column.title}</span>
          <span data-element="arrow" class="sortable-table__sort-arrow">
            <span class="sort-arrow"></span>
          </span>
        </div>
      `;
    });
    return headerHtml.join('');
  }

  getDataTemplate(data) {
    const dataHtml = data.map(item => {

      const rowHtml = this.header.map(column => {
        return column.template(item[column.id]);
      });

      return `
        <a href="/products/${item.id}" class="sortable-table__row">
          ${rowHtml.join('')}
        </a>
      `;
    });

    return dataHtml.join('');
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  initEventListeners() {
    this.subElements.header.addEventListener('pointerdown', this.onHeaderClick);
    document.addEventListener('scroll', this.onScroll);
  }

  onHeaderClick = event => {
    const headerCell = event.target.closest('div');
    const column = this.header.find(c => c.id === headerCell.dataset.id);

    if (column.sortable) {
      const newOrder = headerCell.dataset.order === 'asc' ? 'desc' : 'asc';

      this.sort = {field: column.id, order: newOrder};
      this.data = [];
      this.subElements.body.innerHTML = '';

      this.render();
    }
  }

  onScroll = () => {
    let windowRelativeBottom = document.documentElement.getBoundingClientRect().bottom;
    if (windowRelativeBottom === document.documentElement.clientHeight) {
      if (this.state !== 'loading' && this.state !== 'full') {
        this.loadMore();
      }
    }
  }

  loadMore() {
    const url = this.getUrl({
      _sort: this.sort.field,
      _order: this.sort.order,
      _start: this.data.length,
      _end: this.data.length + this.loadCount,
    });

    this.changeState('loading');

    fetchJson(url)
      .then(jsonData => {
        if (jsonData.length > 0) {
          this.data.push(...jsonData);

          this.subElements.body.innerHTML += this.getDataTemplate(jsonData);
          this.changeState('ready');


        } else {
          this.changeState('full');
        }
      })
      .catch(() => this.changeState('ready'));
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    document.removeEventListener('scroll', this.onScroll);
  }
}

export default class SortableTable {
  element;
  subElements;
  direction = {
    asc: 1,
    desc: -1
  };

  defaultCellTemplate = (cellData) => {
    return `<div class="sortable-table__cell">${cellData}</div>`;
  };

  constructor(header, { data }) {
    this.header = header.map(column => {
      return {
        id: column.id,
        title: column.title,
        sortable: column.sortable,
        sortType: column.sortType || null,
        cellTemplate: column.template || this.defaultCellTemplate,
      };
    });

    this.data = data;

    this.render();
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;

    this.subElements = this.getSubElements(element);
    this.initEventListeners();
  }

  getTemplate() {
    return `
      <div class="sortable-table">
        <div data-element="header" class="sortable-table__header sortable-table__row">
        ${this.getHeaderTemplate()}
        </div>
        <div data-element="body" class="sortable-table__body">
        ${this.getDataTemplate()}
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

  getDataTemplate() {
    const dataHtml = this.data.map(item => {

      const rowHtml = this.header.map(column => {
        return column.cellTemplate(item[column.id]);
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
    this.subElements.header.addEventListener('pointerdown', this.handleHeaderClick.bind(this));
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }

  sort(field, order) {
    this.sortData(field, order);
    const allColumns = this.element.querySelectorAll('.sortable-table__cell[data-id]');
    const currentColumn = this.element.querySelector(`.sortable-table__cell[data-id="${field}"]`);

    // Set sorting arrow
    allColumns.forEach(column => {
      column.dataset.order = '';
    });
    currentColumn.dataset.order = order;

    this.subElements.body.innerHTML = this.getDataTemplate();
  }

  sortData(field, order) {
    const column = this.header.find(c => c.id === field);
    this.data.sort((a, b) => {
      const sortFunction = getSortFunction(column.sortType);
      return this.direction[order] * sortFunction(a[field], b[field]);
    });
    this.subElements.body.innerHTML = this.getDataTemplate();
  }

  handleHeaderClick(event) {
    let headerCell = event.target.closest('div');
    const column = this.header.find(c => c.id === headerCell.dataset.id);

    if (column.sortable) {
      const newOrder = headerCell.dataset.order === 'desc' ? 'asc' : 'desc';
      this.sort(column.id, newOrder);
    }
  }
}


function getSortFunction(sortType) {
  switch (sortType) {
  case 'string':
    return (a, b) => a.localeCompare(b, 'ru', {caseFirst: 'upper'});
  case 'number':
    return (a, b) => a - b;
  }
}



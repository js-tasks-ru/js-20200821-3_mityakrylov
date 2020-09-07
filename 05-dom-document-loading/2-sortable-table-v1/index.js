export default class SortableTable {
  element;
  subElements;

  defaultCellTemplate = (cellData) => {
    return `<div class="sortable-table__cell">${cellData}</div>`;
  };

  constructor(header, { data } ) {
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

    this.subElements = {
      header: this.element.querySelector('.sortable-table__header'),
      body: this.element.querySelector('.sortable-table__body'),
    };
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

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }

  sort(field, order) {
    const column = this.header.find(c => c.id === field);
    this.data.sort((a, b) => {
      const sortFunction = getSortFunction(column.sortType);
      return getOrderValue(order) * sortFunction(a[field], b[field]);
    });
    this.subElements.body.innerHTML = this.getDataTemplate();
  }
}

function getOrderValue(order) {
  switch (order) {
  case 'asc':
    return 1;
  case 'desc':
    return -1;
  default:
    return 1;
  }
}

function getSortFunction(sortType) {
  switch (sortType) {
  case 'string':
    return (a, b) => a.localeCompare(b, 'default', {caseFirst: 'upper'});
  case 'number':
    return (a, b) => a - b;
  }
}



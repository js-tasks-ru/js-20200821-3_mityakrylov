import RangePicker from './components/range-picker/src/index.js';
import SortableTable from './components/sortable-table/src/index.js';
import ColumnChart from './components/column-chart/src/index.js';
import header from './bestsellers-header.js';

import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {
  element;
  subElements;
  components = {};

  constructor() {
    this.initComponents();
  }

  initComponents() {
    const dateTo = new Date();
    const dateFrom = new Date(dateTo);
    dateFrom.setMonth(dateTo.getMonth() - 1);

    this.components.rangePicker = new RangePicker({from: dateFrom, to: dateTo});

    this.components.ordersChart = new ColumnChart({
      url: 'api/dashboard/orders',
      label: 'orders',
      range: {from: dateFrom, to: dateTo},
    });
    this.components.salesChart = new ColumnChart({
      url: 'api/dashboard/sales',
      label: 'sales',
      range: {from: dateFrom, to: dateTo},
      formatHeading: data => `$${data}`
    });
    this.components.customersChart = new ColumnChart({
      url: 'api/dashboard/customers',
      label: 'customers',
      range: {from: dateFrom, to: dateTo},
    });

    this.components.sortableTable = new SortableTable(header, {
      url: `api/dashboard/bestsellers?from=${dateFrom.toISOString()}&to=${dateTo.toISOString()}`,
      isSortLocally: true,
    });
  }

  async render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;

    this.subElements = this.getSubElements(this.element);

    this.renderComponents();

    this.initEventListeners();

    return this.element;
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  renderComponents() {
    Object.entries(this.components).forEach(([name, component]) => {
      this.subElements[name].append(component.element);
    });
  }

  getTemplate() {
    return `
      <div class="dashboard full-height flex-column">
        <div class="content__top-panel">
          <h2 class="page-title">Панель управления</h2>
          <div data-element="rangePicker"></div>
        </div>
        <div data-element="chartsRoot" class="dashboard__charts">
          <div data-element="ordersChart" class="dashboard__chart_orders"></div>
          <div data-element="salesChart" class="dashboard__chart_sales"></div>
          <div data-element="customersChart" class="dashboard__chart_customers"></div>
        </div>
        <h3 class="block-title">Лидеры продаж</h3>
        <div data-element="sortableTable"></div>
      </div>
    `;
  }

  initEventListeners() {
    this.components.rangePicker.element.addEventListener('date-select', (event) => {
      const {from, to} = event.detail;
      this.updateComponents(from, to);
    });
  }

  async updateComponents(from, to) {
    const bestsellersData = await fetchJson(
      `${BACKEND_URL}api/dashboard/bestsellers?from=${from.toISOString()}&to=${to.toISOString()}`
      + '&_sort=title&_order=asc&_start=0&_end=30'
    );

    this.components.sortableTable.addRows(bestsellersData);

    await this.components.ordersChart.update(from, to);
    await this.components.salesChart.update(from, to);
    await this.components.customersChart.update(from, to);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();

    Object.values(this.components).map(component => component.destroy());

    this.element = null;
    this.components = null;
    this.subElements = null;
  }
}

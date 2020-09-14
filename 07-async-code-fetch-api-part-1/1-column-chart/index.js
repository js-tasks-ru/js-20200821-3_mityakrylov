import fetchJson from "./utils/fetch-json.js";

export default class ColumnChart {
  chartHeight = 50;
  element;

  subElements = {
    header: null,
    body: null,
  };

  constructor({
    url = '',
    range: {from: from, to: to} = {},
    value = 0,
    label = '',
    link = '',
    formatHeading = data => `${data}`,
  } = {}) {
    this.url = url;
    this.value = value;
    this.label = label;
    this.link = link;
    this.formatHeading = formatHeading;

    this.data = [];

    this.render();
    this.update(from, to);
  }

  getChartBody(data) {
    const maxValue = Math.max(...data);

    const bodyElements = data.map(value => {
      const scaledValue = Math.floor(value / maxValue * this.chartHeight);
      const percent = (value / maxValue * 100).toFixed();
      return `<div style="--value: ${scaledValue}" data-tooltip="${percent}%"></div>`;
    });
    return bodyElements.join('');
  }

  getLink() {
    return this.link ? `<a class="column-chart__link" href="${this.link}">View all</a>` : '';
  }

  getTemplate() {
    return `
      <div class="column-chart column-chart_loading" style="--chart-height: ${this.chartHeight}">
        <div class="column-chart__title">
          Total ${this.label}
          ${this.getLink()}
        </div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header">
            ${this.getChartBody(this.data)}
          </div>
          <div data-element="body" class="column-chart__chart">
            ${this.formatHeading(this.value)}
          </div>
        </div>
      </div>
    `;
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;

    this.subElements = this.getSubElements(this.element);
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  getUrl(params) {
    const queryParams = Object.entries(params)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => `${key}=${value.toJSON()}`)
      .join('&');

    return (
      `https://course-js.javascript.ru/${this.url}`
      + (queryParams ? `?${queryParams}` : '')
    );
  }

  update(from, to) {
    this.element.classList.add('column-chart_loading');

    const url = this.getUrl({from: from, to: to});

    return new Promise((resolve, reject) => {
      fetchJson(url)
        .then(jsonData => {
          this.data = [...Object.values(jsonData)];
          this.value = this.data.reduce((a, b) => a + b, 0);

          this.subElements.header.innerHTML = this.formatHeading(this.value);
          this.subElements.body.innerHTML = this.getChartBody(this.data);

          this.element.classList.remove('column-chart_loading');

          resolve();
        })
        .catch(() => {
          this.data = [];
          this.value = 0;
          reject(new Error('Update error'));
        });
    });
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}

export default class ColumnChart {
  element;
  chartHeight = 50;

  constructor({data = [], label = '', value = '', link = ''} = {}) {
    this.data = data;
    this.label = label;
    this.headerValue = value;
    this.link = link;

    this.render();
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
    if (!this.link) {
      return '';
    }
    return `<a class="column-chart__link" href="${this.link}">View all</a>`;
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
            ${this.headerValue}
          </div>
          <div data-element="body" class="column-chart__chart">
            ${this.getChartBody(this.data)}
          </div>
        </div>
      </div>
    `;
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;

    if (this.data.length) {
      this.element.classList.remove('column-chart_loading');
    }
  }

  update(data) {
    this.data = data;
    const chartBodyElement = this.element.querySelector('.column-chart__chart');
    chartBodyElement.innerHTML = this.getChartBody(data);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}

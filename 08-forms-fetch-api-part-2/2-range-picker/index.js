export default class RangePicker {
  from;
  to;
  selectedFrom = null;

  monthFirst;

  subElements = {
    input: null,
    selector: null,
    from: null,
    to: null,
    left: null,
    right: null,
  };

  constructor({from = new Date(), to = new Date()} = {}) {
    this.from = from;
    this.to = to;

    this.monthFirst = new Date(this.from);

    this.render();
    this.initEventListeners();
  }

  initEventListeners() {
    this.subElements.input.addEventListener('click', this.onInputClick);
    this.subElements.selector.addEventListener('click', this.onSelectorClick);
  }

  isOpened() {
    return this.element.classList.contains('rangepicker_open');
  }

  open() {
    this.element.classList.add('rangepicker_open');
    this.renderSelector();
    document.addEventListener('click', this.onDocumentClick, {capture: true});
  }

  close() {
    this.element.classList.remove('rangepicker_open');
    document.removeEventListener('click', this.onDocumentClick, {capture: true});
  }

  onInputClick = () => {
    if (this.isOpened()) {
      this.close();
    } else {
      this.open();
    }
  }

  onDocumentClick = (event) => {
    if (this.element.contains(event.target)) {
      return;
    }

    this.close();
  }

  onSelectorClick = (event) => {
    if (event.target.classList.contains('rangepicker__cell')) {
      this.select(new Date(Date.parse(event.target.dataset.value)));
    }
  }

  moveMonth(month) {
    this.monthFirst.setMonth(this.monthFirst.getMonth() + month);
    this.renderSelector();
  }

  select(date) {
    if (!this.selectedFrom) {

      this.selectedFrom = date;
      this.renderSelection();

    } else {

      [this.from, this.to] = this.selectedFrom < date
        ? [this.selectedFrom, date]
        : [date, this.selectedFrom];
      this.selectedFrom = null;

      this.renderSelection();
      this.updateInput();

      this.element.dispatchEvent(new CustomEvent('date-select', { bubbles: true }));
    }
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;

    this.subElements = this.getSubElements(this.element);

    this.updateInput();
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  updateInput() {
    this.subElements.from.innerHTML = this.from.toLocaleString('ru', { dateStyle: 'short' });
    this.subElements.to.innerHTML = this.to.toLocaleString('ru', { dateStyle: 'short' });
  }

  renderSelector() {
    const monthSecond = new Date(this.monthFirst);
    monthSecond.setMonth(this.monthFirst.getMonth() + 1);

    const htmlElements = [
      '<div class="rangepicker__selector-arrow"></div>',
      '<div class="rangepicker__selector-control-left"></div>',
      '<div class="rangepicker__selector-control-right"></div>',
      this.getCalendarTemplate(this.monthFirst),
      this.getCalendarTemplate(monthSecond),
    ];
    this.subElements.selector.innerHTML = htmlElements.join('\n');

    this.subElements.selector.querySelector('.rangepicker__selector-control-left').addEventListener(
      'click', () => {this.moveMonth(-1);}
    );
    this.subElements.selector.querySelector('.rangepicker__selector-control-right').addEventListener(
      'click', () => {this.moveMonth(1);}
    );

    this.renderSelection();
  }

  renderSelection() {
    for (const dayButton of this.subElements.selector.querySelectorAll('.rangepicker__cell')) {
      dayButton.classList.remove(
        'rangepicker__selected-from', 'rangepicker__selected-to', 'rangepicker__selected-between');

      if (this.selectedFrom) {
        if (this.selectedFrom.toISOString() === dayButton.dataset.value) {
          dayButton.classList.add('rangepicker__selected-from');
        }
        continue;
      }

      if (dayButton.dataset.value === this.from.toISOString()) {
        dayButton.classList.add('rangepicker__selected-from');
      } else if (dayButton.dataset.value === this.to.toISOString()) {
        dayButton.classList.add('rangepicker__selected-to');
      } else if (dayButton.dataset.value > this.from.toISOString() &&
        dayButton.dataset.value < this.to.toISOString()) {
        dayButton.classList.add('rangepicker__selected-between');
      }
    }
  }

  getTemplate() {
    return `
      <div class="rangepicker">
        <div class="rangepicker__input" data-element="input">
          <span data-element="from"></span> -
          <span data-element="to"></span>
        </div>
        <div class="rangepicker__selector" data-element="selector"></div>
      </div>
    `;
  }

  getCalendarTemplate(date) {
    return `
      <div class="rangepicker__calendar">
        <div class="rangepicker__month-indicator">
          <time datetime="November">${date.toLocaleString('ru', { month: 'long' })}</time>
        </div>
        <div class="rangepicker__day-of-week">
          <div>Пн</div>
          <div>Вт</div>
          <div>Ср</div>
          <div>Чт</div>
          <div>Пт</div>
          <div>Сб</div>
          <div>Вс</div>
        </div>
        <div class="rangepicker__date-grid">
          ${this.getCalendarGridTemplate(date)}
        </div>
      </div>
    `;
  }

  getCalendarGridTemplate(date) {
    const lastMonthDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const gridButtons = [];
    for (let day = 1; day <= lastMonthDay.getDate(); ++day) {

      const dayDate = new Date(date.getFullYear(), date.getMonth(), day);
      const style = day === 1
        ? `style="--start-from: ${dayDate.getDay() + 1}"`
        : '';

      gridButtons.push(
        `<button type="button" class="rangepicker__cell"
          data-value="${dayDate.toISOString()}" ${style}>${day}
         </button>`
      );
    }
    return gridButtons.join('\n');
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();

    this.element = null;
    this.from = new Date();
    this.to = new Date();
    this.selectedFrom = null;
    this.monthFirst = null;

    document.removeEventListener('click', this.onDocumentClick, {capture: true});
  }
}

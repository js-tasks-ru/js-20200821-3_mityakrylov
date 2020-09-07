export default class NotificationMessage {
  element;

  constructor(message = '', {type = 'success', duration = 1000} = {}) {
    this.message = message;
    this.type = type;
    this.duration = duration;

    this.render();
  }

  getTemplate() {
    return `
      <div class="notification ${this.type}" style="--value:${this.duration / 1000}s">
        <div class="timer"></div>
        <div class="inner-wrapper">
          <div class="notification-header">${this.type}</div>
          <div class="notification-body">
            ${this.message}
          </div>
        </div>
      </div>
    `;
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
  }

  show(parent = document.body) {
    if (document.notification !== undefined) {
      document.notification.remove();
    }

    parent.append(this.element);
    document.notification = this;
    setTimeout(() => this.remove(), this.duration);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}

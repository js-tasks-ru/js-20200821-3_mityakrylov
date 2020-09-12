class Tooltip {
  element;

  initialize() {
    document.addEventListener('pointerover', this.onPointerOver.bind(this));
    document.addEventListener('pointerout', this.onPointerOut.bind(this));
    document.addEventListener('pointermove', this.onPointerMove.bind(this));
  }

  getTemplate() {
    return `<div class="tooltip">Tooltip</div>`;
  }

  render() {
    if (this.element) {
      return;
    }
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;

    document.body.append(this.element);
  }

  remove() {
    if (!this.element) {
      return;
    }
    this.element.remove();
    this.element = null;
    // this.currentTooltipTarget = null;
  }

  destroy() {
    this.remove();
    document.removeEventListener('pointerover', this.onPointerOver.bind(this));
    document.removeEventListener('pointerout', this.onPointerOut.bind(this));
    document.removeEventListener('pointermove', this.onPointerMove.bind(this));
  }

  onPointerOver(event) {
    if (event.target.dataset.tooltip) {
      this.render();
      this.element.innerHTML = event.target.dataset.tooltip;
    }
  }

  onPointerOut(event) {
    if (event.relatedTarget && !event.relatedTarget.dataset.tooltip) {
      this.remove();
    }
  }

  onPointerMove(event) {
    if (!this.element) {
      return;
    }

    this.element.style.left = event.pageX + 10 + 'px';
    this.element.style.top = event.pageY + 10 + 'px';
  }

}

const tooltip = new Tooltip();

export default tooltip;

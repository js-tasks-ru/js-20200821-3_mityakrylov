export default class SortableList {
  element;
  items;

  draggedItem;
  draggedPosition = {
    shiftX: 0,
    shiftY: 0,
  }
  placeholder;

  constructor({items = []} = {}) {
    this.items = items;

    this.render();
    this.initEventListeners();
  }

  render() {
    this.element = document.createElement('ul');
    this.element.classList.add('sortable-list');

    this.items.forEach(item => {
      item.classList.add('sortable-list__item');
      this.element.append(item);
    });

    this.placeholder = document.createElement('div');
    this.placeholder.classList.add('sortable-list__placeholder');
  }

  initEventListeners() {
    this.element.addEventListener('pointerdown', this.onPointerDown);
  }

  onPointerDown = (event) => {
    event.preventDefault();

    const item = event.target.closest('li');

    if (event.target.hasAttribute('data-grab-handle')) {
      this.draggedPosition.shiftX = event.clientX - item.getBoundingClientRect().left;
      this.draggedPosition.shiftY = event.clientY - item.getBoundingClientRect().top;
      this.startDragging(item);
    } else if (event.target.hasAttribute('data-delete-handle')) {
      item.remove();
    }
  }

  startDragging(item) {
    this.placeholder.style.width = item.offsetWidth + 'px';
    this.placeholder.style.height = item.offsetHeight + 'px';

    this.draggedItem = item;
    this.draggedItem.style.width = item.offsetWidth + 'px';
    this.draggedItem.style.height = item.offsetHeight + 'px';
    this.draggedItem.style.left = item.getBoundingClientRect().left + 'px';
    this.draggedItem.style.top = item.getBoundingClientRect().top + 'px';
    this.draggedItem.classList.add('sortable-list__item_dragging');

    item.replaceWith(this.placeholder);
    this.element.append(this.draggedItem);

    document.addEventListener('pointermove', this.onPointerMove);
    document.addEventListener('pointerup', this.onPointerUp);
  }

  onPointerMove = (event) => {
    this.draggedItem.style.left = event.clientX - this.draggedPosition.shiftX + 'px';
    this.draggedItem.style.top = event.clientY - this.draggedPosition.shiftY + 'px';

    this.draggedItem.style.visibility = 'hidden';
    const elementBelow = document.elementFromPoint(event.clientX, event.clientY);
    this.draggedItem.style.visibility = 'visible';
    if (!elementBelow) {
      return;
    }

    const itemBelow = elementBelow.closest('.sortable-list__item');
    const inThisList = this.items.includes(itemBelow);
    if (!itemBelow || !inThisList) {
      return;
    }

    if (event.clientY < itemBelow.getBoundingClientRect().top + itemBelow.offsetHeight / 2) {
      itemBelow.before(this.placeholder);
    } else {
      itemBelow.after(this.placeholder);
    }
  }

  onPointerUp = () => {
    this.draggedItem.removeAttribute('style');
    this.draggedItem.classList.remove('sortable-list__item_dragging');

    this.placeholder.replaceWith(this.draggedItem);

    this.draggedItem = null;

    document.removeEventListener('pointermove', this.onPointerMove);
    document.removeEventListener('pointerup', this.onPointerUp);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();

    this.element = null;
    this.items = null;
    this.draggedItem = null;
    this.draggedPosition = null;
    this.placeholder = null;
  }
}

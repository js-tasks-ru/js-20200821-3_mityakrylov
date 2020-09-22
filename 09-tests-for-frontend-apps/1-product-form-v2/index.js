import SortableList from '../2-sortable-list/index.js';
import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
  element;
  form;
  subElements = {
    productForm: null,
    imageListContainer: null,
  }

  product = {
    title: '',
    description: '',
    quantity: 1,
    subcategory: '',
    status: 1,
    price: 100,
    discount: 0,
  }
  subcategories = [];

  imageSortableList;

  constructor(productId) {
    this.productId = productId;

    this.imageSortableList = new SortableList();
  }

  async render() {
    await this.loadData();
    this.renderForm();
    this.initEventListeners();

    return this.element;
  }

  async loadData() {
    const [categoriesData, productData] = await Promise.all([
      this.loadCategoriesData(),
      this.productId
        ? this.loadProductData(this.productId)
        : [this.product]
    ]);

    for (const category of categoriesData) {
      for (const subcategory of category.subcategories) {
        this.subcategories.push({
          id: subcategory.id,
          text: `${category.title} > ${subcategory.title}`
        });
      }
    }

    if (productData.length) {
      Object.keys(this.product).forEach(key => this.product[key] = productData[0][key]);
      productData[0].images.forEach(image => this.imageSortableList.push(this.getImageElement(image)));
    }
  }

  loadCategoriesData() {
    return fetchJson(`${BACKEND_URL}/api/rest/categories?_sort=weight&_refs=subcategory`);
  }

  loadProductData(productId) {
    return fetchJson(`${BACKEND_URL}/api/rest/products?id=${productId}`);
  }

  renderForm() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;

    this.subElements = this.getSubElements(this.element);

    this.form = this.subElements.productForm.elements;
    Object.entries(this.product).forEach(([key, value]) => this.form[key].value = value);

    this.subElements.imageListContainer.append(this.imageSortableList.element);
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  getTemplate() {
    return `
      <div class="product-form">
        <form data-element="productForm" class="form-grid">
          <div class="form-group form-group__half_left">
            <fieldset>
              <label class="form-label">Название товара</label>
              <input required="" type="text" name="title" id="title" class="form-control" placeholder="Название товара">
            </fieldset>
          </div>
          <div class="form-group form-group__wide">
            <label class="form-label">Описание</label>
            <textarea required="" class="form-control" name="description" id="description" data-element="productDescription"
                      placeholder="Описание товара"></textarea>
          </div>
          <div class="form-group form-group__wide" data-element="sortable-list-container">
            <label class="form-label">Фото</label>
            <div data-element="imageListContainer">
            </div>
            <button type="button" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
            <input type="file" name="imageInput" hidden/>
          </div>
          <div class="form-group form-group__half_left">
            <label class="form-label">Категория</label>
            <select class="form-control" name="subcategory" id="subcategory">
            ${this.getCategoriesTemplate()}
            </select>
          </div>
          <div class="form-group form-group__half_left form-group__two-col">
            <fieldset>
              <label class="form-label">Цена ($)</label>
              <input required="" type="number" name="price" id="price" class="form-control" placeholder="100">
            </fieldset>
            <fieldset>
              <label class="form-label">Скидка ($)</label>
              <input required="" type="number" name="discount" id="discount" class="form-control" placeholder="0">
            </fieldset>
          </div>
          <div class="form-group form-group__part-half">
            <label class="form-label">Количество</label>
            <input required="" type="number" class="form-control" name="quantity" id="quantity" placeholder="1">
          </div>
          <div class="form-group form-group__part-half">
            <label class="form-label">Статус</label>
            <select class="form-control" name="status" id="status">
              <option value="1">Активен</option>
              <option value="0">Неактивен</option>
            </select>
          </div>
          <div class="form-buttons">
            <button type="submit" name="save" class="button-primary-outline">
              Сохранить товар
            </button>
          </div>
        </form>
      </div>
    `;
  }

  getImageElement(imageItem) {
    const element = document.createElement('div');

    element.innerHTML = `
      <li class="products-edit__imagelist-item" style="">
        <input type="hidden" name="url" value="${imageItem.url}">
        <input type="hidden" name="source" value="${imageItem.source}">
        <span>
          <img src="icon-grab.svg" data-grab-handle="" alt="grab">
          <img class="sortable-table__cell-img" alt="${imageItem.source}" src="${imageItem.url}">
          <span>${imageItem.source}</span>
        </span>
        <button type="button">
          <img src="icon-trash.svg" data-delete-handle="" alt="delete">
        </button>
      </li>
    `;

    return element.firstElementChild;
  }

  getCategoriesTemplate() {
    return this.subcategories.map(subcategory => {
      return `<option value="${subcategory.id}">${escapeHtml(subcategory.text)}</option>`;
    }).join('\n');
  }

  initEventListeners() {
    this.form.uploadImage.addEventListener('click', () => this.form.imageInput.click());
    this.form.imageInput.addEventListener('change', this.uploadImageForm);

    this.subElements.productForm.addEventListener('submit', (event) => {
      event.preventDefault();
      this.save();
    });
  }

  uploadImageForm = async () => {
    const file = this.form.imageInput.files[0];
    const formData = new FormData();
    formData.append('image', file);

    const imgurJson = await fetchJson('https://api.imgur.com/3/image', {
      method: 'POST',
      headers: {
        Authorization: `Client-ID ${IMGUR_CLIENT_ID}`
      },
      body: formData,
    });

    const imageItem = {
      url: imgurJson.data.link,
      source: file.name,
    };

    this.imageSortableList.push(this.getImageElement(imageItem));
  }

  async save() {
    this.product = {
      title: this.form.title.value,
      description: this.form.description.value,
      quantity: parseInt(this.form.quantity.value),
      subcategory: this.form.subcategory.value,
      status: parseInt(this.form.status.value),
      price: parseInt(this.form.price.value),
      discount: parseInt(this.form.discount.value),
    };

    const imageHtmlList = [...this.subElements.imageListContainer.querySelectorAll('.sortable-table__cell-img')];
    const productData = {
      ...this.product,
      id: this.productId,
      images: imageHtmlList.map(imageHtml => ({url: imageHtml.src, source: imageHtml.alt})),
    };
    const method = this.productId ? 'PATCH' : 'PUT';

    await fetchJson(`${BACKEND_URL}/api/rest/products`, {
      method: method,
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(productData),
    });

    const customEvent = method === 'PUT'
      ? new CustomEvent('product-saved', { detail: productData, bubbles: true })
      : new CustomEvent('product-updated', { detail: productData, bubbles: true });
    this.element.dispatchEvent(customEvent);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = null;
    this.imageSortableList = null;
  }

}

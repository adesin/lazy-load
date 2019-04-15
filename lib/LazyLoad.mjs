/**
 * Lazy Load
 *
 * Использование:
 * - Картинка - <img class="js-lazy-load" data-src="image.jpg" />
 * - Фоновое изображение -  <div class="js-lazy-load" data-bg="image.jpg"></div>
 *
 * @author Anton Desin anton.desin@gmail.com
 * @copyright (c) Anton Desin | Интернет-агентство IT People
 * @link https://itpeople.ru
 */

import 'intersection-observer';

const defaultSelectors = {
  container: null,
  element: '.js-lazy-load'
};

const defaultObserverOptions = {
  rootMargin: '200px',
  threshold: 0.01
};

export default class LazyLoad {

  constructor(options = {}) {
    this.__options = {};
    this.elements = null;
    this.container = null;
    this.observer = null;

    this.__processOptions(options);
    this.__initialize();
  }

  /**
   * Инициализация IntersectionObserver
   * @private
   */
  __initialize() {
    this.elements = document.querySelectorAll(this.__options.selectors.element);
    if (!this.elements.length) return;

    this.observer = new IntersectionObserver(entries => this.__onIntersection(entries), this.__observerConfig);
    if (this.__options.observe === true) {
      this.elements.forEach(element => this.observeElement(element));
    }
  }

  /**
   * Наблюдение за элементом. Возвращает промис
   * @param element Наблюдаемый DOM-элемент
   * @returns {Promise}
   */
  observeElement(element, force = false) {
    if (!element) return Promise.reject("LazyLoad.observeElement(): Элемент не найден");

    const isElementObserve = (
      typeof element.dataset !== 'undefined'
      && typeof element.dataset.observe !== 'undefined'
      && element.dataset.observe === 'false'
    )
      ? false
      : true;

    if (isElementObserve === false && force !== true) return Promise.resolve();

    return new Promise((resolve, reject) => {
      element.resolveIntersection = resolve;
      this.observer.observe(element);
    });
  }

  /**
   * Принудительная загрузка элементов внутри контейнера
   *
   * Например, если обсервером был загружен скрипт,
   * который изменил структуру DOM, сломав тем самым
   * наблюдатели внутри данного контейнера
   *
   * @param container DOM-элемент или селектор
   * @returns {Promise}
   */
  loadContainer(container = document) {
    let promise = [];

    if (typeof container === 'string') {
      container = document.querySelector(container);
    }

    let elements = container.querySelectorAll(this.__options.selectors.element);
    if (!elements.length) return;

    elements.forEach(element => {
      promise.push(new Promise((resolve) => {
        element.resolveIntersection = resolve;
        this.__loadElement(element);
      }));
    });

    return promise.length ? Promise.all(promise) : Promise.resolve(null);
  }

  /**
   * Коллюэк IntersectionObserver
   * @param entries
   * @private
   */
  __onIntersection(entries) {
    entries.forEach(entry => {
      if (this.__isEntryIntersecting(entry)) {
        this.observer.unobserve(entry.target);
        this.__loadElement(entry.target);
      }
    });
  }

  __isEntryIntersecting(entry) {
    return entry.isIntersecting || entry.intersectionRatio > 0;
  }

  /**
   * Загрузка элемента
   * @param element Элемент
   * @private
   */
  __loadElement(element) {
    if (typeof element.dataset.src !== 'undefined') {
      element.onload = () => element.resolveIntersection(element);
      element.onerror = () => element.resolveIntersection(element);
      element.src = element.dataset.src;
    } else if (typeof element.dataset.bg !== 'undefined') {
      //  Создаём элемент для отслеживания момента загрузки
      let img = new Image();
      img.onload = () => element.resolveIntersection(element);
      img.onerror = () => element.resolveIntersection(element);
      img.src = element.dataset.bg;
      element.style.backgroundImage = `url(${element.dataset.bg})`;
    } else {
      element.resolveIntersection(element);
    }

    //if(element.classList.indexOf(this.__options.selectors.element !== -1)){
    element.classList.remove(this.__options.selectors.element);
    //}
  }

  /**
   * Получение настроек для IntersectionObserver
   * @returns {{root: (null|*), rootMargin: (string|*|string|string|string|string), threshold}}
   * @private
   */
  get __observerConfig() {
    return {
      root: this.__options.selectors.container
        ? document.querySelector(this.__options.selectors.container)
        : null,
      rootMargin: this.__options.observer.rootMargin,
      threshold: this.__options.observer.threshold
    };
  }

  /**
   * Обработка настроек
   * @param options
   * @private
   */
  __processOptions(options) {
    this.__options.observe = typeof options.observe !== 'undefined' && options.observe === false ? false : true;
    this.__options.selectors = Object.assign({}, defaultSelectors, options.selectors);
    this.__options.observer = Object.assign({}, defaultObserverOptions, options.observer);
  }

}
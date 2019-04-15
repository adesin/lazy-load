# Lazy Load

Отложенная (ленивая) загрузка изображений, скриптов и т.д. при помощи Intersection Observer c полифиллом.

## Установка

```cmd
$ yarn add @itpeople/lazy-load
```

## Использование

```js
import LazyLoad from '@itpeople/lazy-load';
```

### Можно также загружать модуль динамически

Это сэкономит немного места в основном бандле

```js
window.addEventListener('load', async () => {
  const { default: LazyLoad } = await import('@itpeople/lazy-load');
});
```

### Создание экземпляр и запуск отслеживания

```js
const lazyLoad = new LazyLoad();
``` 

### Пример HTML-кода

```html
<img class="js-lazy-load" data-src="image.jpg">
```

### Использование с фоновыми изображениями

```html
<div class="js-lazy-load" data-bg="image-2.jpg"></div>
```

## Отложенная загрузка js-кода

Возможна также отложенная загрузка JS-кода, для этого необходимо загрузить модуль динамически.

```js
lazyLoad
    .observeElement(document.querySelector('.some-element'))
    .then(element => {
      //  Загружаем модуль JS, CSS-файл, выполняем какой-либо код и т.д.
      import('./components/some-module.js');
    }, error => {});
```
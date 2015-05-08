# Шина данных [![Build Status](https://travis-ci.org/InnovaCo/event-bus.svg?branch=master)](https://travis-ci.org/InnovaCo/event-bus)

Шина данных, используемая в качестве центрального механизма передачи данных между компонентами сайта. Представляет из себя глобальный singleton-объект, через который различные модули общаются между собой. 

Пример:

```js
// подписываемся на событие
eventBus.subscribe({
    topic: 'event-name',
    callback: function(data, envelope) {
        console.log('Received', data);
    }
});

// вещаем события
eventBus.publish({
    topic: 'event-name',
    data: 'Hello world'
});
```

Шина написана с использованием [Require.js](http://requirejs.org), то есть можно подключать и так:

```js
require('eventBus').publish({
    topic: 'event-name',
    data: 'Hello world'
});
```

Построен на основе [Postal.js](https://github.com/postaljs/postal.js) с некоторыми улучшениями:

## Backbone-фасад

Для удобства использования, а также для обратной совместимости с некоторыми компонентами, в Postal.js добавлены методы `on()`, `off()`, `trigger()` которые полностью совместимы с `Backbone.Events` версии `0.9.2`.

Поддерживается:

1. Методы `on`, `off`, `trigger` поддерживают цепочку вызова (chaining);
1. Методы `on`, `off` поддерживают передачу контекста выполнения. Без передачи контекста будет использоваться объект фасада;
1. Метод `trigger` поддерживает передачу множественных данных через аргументы;
1. Методы `on`, `off`, `trigger` поддерживают использование множественных имен событий. Имя событий необходимо разделять пробелом;
1. Широковещательное событие `all`.

Не поддерживается:

1. Из-за особенности postal.js ставить в ожидание отписывание событий при активном вещании других событий нижеописанный кейс приведет к зацикливанию и зависанию программы.

    ```js
    // [WARNING] Данный код приведет к зацикливанию и зависанию!!!
    var handler = function() {
    	// Some code 
    	eventBus.off('event', handler);
    	eventBus.trigger('event');
    }
    eventBus.on('event', handler);
    eventBus.trigger('event');
    ```

Примеры:


```js
// подписываемся на событие
eventBus.on('my-event', function(data) {
    console.log('Received', data);
});

// подписываемся на событие конкретного канала
eventBus.on('@my-channel', 'my-event', function(data) {
    console.log('Received', data);
});
eventBus.channel('my-channel').on('my-event', function(data) {
    console.log('Received', data);
});

// вещаем событие на основном канале
eventBus.trigger('my-event', 'Test message');

// вещаем событие на канале my-channel
eventBus.trigger('@my-channel', 'my-event', 'Test message');
eventBus.channel('my-channel').trigger('my-event', 'Test message');

// отписываемся от события
eventBus.off('my-event');
eventBus.off('my-event', callback);
eventBus.off('@my-channel', 'my-event', callback);
```

## Хранение сообщений

Сообщения с некоторых событий можно сохранить, чтобы последующие подписчики его получли, даже если они подписались на событие после того, как оно было запущено. Для этого достаточно добавить `!` к названию события во время его публикации:

```js
eventBus.on('my-event', function(data) {
    console.log('listener1:', data);
});

// говорим, что сообщение нужно сохранить
eventBus.trigger('!my-event', 'test');

setTimeout(function() {
    eventBus.on('my-event', function(data) {
        console.log('listener2:', data);
    });
}, 100);
```

Результат выполнения кода:

```
listener1: test
listener2: test
```

Однако следующий вызов события без префикса `!` сбрасывает сохранённое состояние:

```js
eventBus.on('my-event', function(data) {
    console.log('listener1:', data);
});

// говорим, что сообщение нужно сохранить
eventBus.trigger('!my-event', 'foo');

setTimeout(function() {
    eventBus.on('my-event', function(data) {
        console.log('listener2:', data);
    });
    eventBus.trigger('my-event', 'bar');

    eventBus.on('my-event', function(data) {
        // этот обработчик автоматически не вызовется
        console.log('listener3:', data);
    });
}, 100);
```

Результат выполнения кода:

```
listener1: foo
listener2: foo
listener1: bar
listener2: bar
```
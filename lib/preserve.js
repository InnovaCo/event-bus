/**
 * Механизим, добавляющий «запоминание» данных для некоторых событий.
 * Для таких событий даже если обработчик подписался после того,
 * как событие сработало, обработчик будет вызван с результатом
 * последнего вызова события.
 *
 * Используется следующая конвенция: если событие вызывается
 * с префиксом `!`, то данные этого события сохраняются 
 * и передаются всем последующим подписчикам. Следующий вызов 
 * этого же события без префикса `!` сбрасывает это состояние,
 * то есть все последующие подписчики его не получат
 */
if (typeof module === 'object' && typeof define !== 'function') {
	var define = function (factory) {
		module.exports = factory(require, exports, module);
	};
}

define(function(require, exports, module) {
	return function(postal) {
		var storage = {};

		postal.addWireTap(function(d, e) {
			var save = false;
			if (/^\!/.test(e.topic)) {
				save = true;
				e.topic = e.topic.substr(1);
			}

			storage[e.channel] = storage[e.channel] || {};

			if (save) {
				// соханяем данные для следующих подписчиков
				storage[e.channel][e.topic] = d;
			} else if (e.topic in storage[e.channel]) {
				// вызвали событие без префикса — удаляем данные
				delete storage[e.channel][e.topic];
			}
		});

		// XXX жуткий хардкод, но пока не могу представить, как сделать лучше:
		// перехватываем вызов subscribe (привязка коллбэка слушателя)
		// и сразу вызываем коллбэк с сохранёнными данными
		var sdp = postal.SubscriptionDefinition.prototype;
		var origin = sdp.subscribe;
		sdp.subscribe = function() {
			var result = origin.apply(this, arguments),
				_this = this;

			if (storage[this.channel] && this.topic in storage[this.channel]) {
				// Задарежка необходима, для того чтоб перед тем как обработчик событий получит 
				// закешированное событие он успел выполнить весь цикл инициализации.
				setTimeout(function() {
					var data = storage[_this.channel][_this.topic];
					_this.callback(data, {
						channel: _this.channel,
						topic: _this.topic,
						timeStamp: new Date(),
						data: data
					});
				}, 10);
			}
			return result;
		};

		return postal;
	};
});
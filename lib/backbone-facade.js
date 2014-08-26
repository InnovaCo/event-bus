if (typeof module === 'object' && typeof define !== 'function') {
	var define = function (factory) {
		module.exports = factory(require, exports, module);
	};
}

define(function(require, exports, module) {
	var postal = require('postal');
	var eventSplitter = /\s+/;

	/**
	 * Фасад событий, привычный по Backbone
	 */
	return {
		/**
		 * Подписка на события
		 * @param  {String}   channel  Название канала, на который подписываемся.
		 * Если не указан (передали 2 аргумента), подписываемся на глобальное событие
		 * @param  {String}   event    Название события, на которе подписываемся
		 * @param  {Function} callback 
		 */
		on: function(channel, events, callback, context) {
			var event,
				subscription,
				proxyCallback = function(data) {
					if (typeof callback === 'function') {
						return callback.apply(this, data.__args);
					}
				};

			if (typeof events !== 'string') {
				context = callback;
				callback = events;
				events = channel;
				channel = null;
			}

			proxyCallback.__original = callback;
			events = events.split(eventSplitter);

			if (!channel && this instanceof postal.ChannelDefinition) {
				channel = this.channel;
			}

			while (event = events.shift()) {
				subscription = postal.subscribe({
					channel: channel,
					topic: event,
					callback: proxyCallback
				});
				subscription.callback.context(context);
			}

			return this;
		},

		/**
		 * Отписываемся от событий.
		 * @param  {String}   channel  Название канала, на который подписываемся.
		 * Если не указан (передали 2 аргумента), подписываемся на глобальное событие
		 * @param  {String}   event    Название события, на которе подписываемся
		 * @param  {Function} callback 
		 */
		off: function(channel, events, callback, context) {
			var event,
				topics,
				subs;

			if (typeof events !== 'string') {
				context = callback;
				callback = events;
				events = channel;
				channel = null;
			}

			events = events.split(eventSplitter);

			if (!channel && this instanceof postal.ChannelDefinition) {
				channel = this.channel;
			}

			// В отличие от Backbone, в Postal используется иная концепция
			// отписывания от событий: нужно получить от метода on()/subscribe()
			// объект подписки и уже у него вызывать unsubscribe.
			topics = postal.subscriptions[channel || postal.configuration.DEFAULT_CHANNEL];

			if (!topics) {
				return;
			}

			while (event = events.shift()) {
				subs = topics[event] || [];

				if (callback) {
					subs = subs.filter(function(s) {
						return s.callback.target().__original === callback && (context != null ? s.callback.context() === context : true);
					});
				}

				postal.unsubscribe.apply(postal, subs);
			}

			return this;
		},

		/**
		 * Вызов события.
		 * @param  {String}   channel  Название канала, на который подписываемся.
		 * Если не указан (передали 2 аргумента), подписываемся на глобальное событие
		 * @param  {String}   event    Название события, на которе подписываемся
		 * @param  {Object}   data     Данные, которые передаём в событие
		 */
		trigger: function(channel, events) {
			var data = {
					__args: null
				},
				event;

			if (typeof events !== 'string') {
				data.__args = Array.prototype.slice.call(arguments, 1);
				events = channel;
				channel = null;
			} else {
				data.__args = Array.prototype.slice.call(arguments, 2);
			}

			events = events.split(eventSplitter);

			if (!channel && this instanceof postal.ChannelDefinition) {
				channel = this.channel;
			}

			while (event = events.shift()) {
				postal.publish({
					channel: channel,
					topic: event,
					data: data
				});
			}

			return this;
		}
	};
});
if (typeof module === 'object' && typeof define !== 'function') {
	var define = function (factory) {
		module.exports = factory(require, exports, module);
	};
}

define(function(require, exports, module) {
	var postal = require('postal');

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
		on: function(channel, event, callback) {
			if (typeof event !== 'string') {
				callback = event;
				event = channel;
				channel = null;
			}

			if (!channel && this instanceof postal.ChannelDefinition) {
				channel = this.channel;
			}

			return postal.subscribe({
				channel: channel,
				topic: event,
				callback: callback
			});
		},

		/**
		 * Отписываемся от событий.
		 * @param  {String}   channel  Название канала, на который подписываемся.
		 * Если не указан (передали 2 аргумента), подписываемся на глобальное событие
		 * @param  {String}   event    Название события, на которе подписываемся
		 * @param  {Function} callback 
		 */
		off: function(channel, event, callback) {
			if (typeof event !== 'string') {
				callback = event;
				event = channel;
				channel = null;
			}

			if (!channel && this instanceof postal.ChannelDefinition) {
				channel = this.channel;
			}

			// В отличие от Backbone, в Postal используется иная концепция
			// отписывания от событий: нужно получить от метода on()/subscribe()
			// объект подписки и уже у него вызывать unsubscribe.
			var topics = postal.subscriptions[channel || postal.configuration.DEFAULT_CHANNEL];
			if (!topics) {
				return;
			}

			var subs = topics[event] || [];
			if (callback) {
				subs = subs.filter(function(s) {
					return s.callback.target() === callback;
				});
			}

			return postal.unsubscribe.apply(postal, subs);
		},

		/**
		 * Вызов события.
		 * @param  {String}   channel  Название канала, на который подписываемся.
		 * Если не указан (передали 2 аргумента), подписываемся на глобальное событие
		 * @param  {String}   event    Название события, на которе подписываемся
		 * @param  {Object}   data     Данные, которые передаём в событие
		 */
		trigger: function(channel, event, data) {
			if (typeof event !== 'string') {
				data = event;
				event = channel;
				channel = null;
			}

			if (!channel && this instanceof postal.ChannelDefinition) {
				channel = this.channel;
			}

			return postal.publish({
				channel: channel,
				topic: event,
				data: data
			});
		}
	};
});
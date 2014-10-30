/**
 * Механизим, добавляющий механизм request-response сообщений.
 *
 * Используется следующая конвенция: если событие вызывается
 * с префиксом `/`, то тип событие - команда и ожидается ответ
 */
if (typeof module === 'object' && typeof define !== 'function') {
	var define = function(factory) {
		module.exports = factory(require, exports, module);
	};
}

define(function(require, exports, module) {

	var channelTest = /^@/;
	var commandTest = /\//;
	var $;

	return function(postal) {
		var sdp = postal.SubscriptionDefinition.prototype;

		postal.configuration.promise = {
			createDeferred: function() {
				$ = $ || require('jquery');
				return $.Deferred();
			},
			getPromise: function(promise) {
				return promise.promise();
			},
			fulfill: "resolve",
			fail: "reject",
		};

		postal.request = function(channel, command) {
			var data = {
				__args: null
			};

			if (typeof channel !== 'string') {
				return this;
			}

			if (channelTest.test(channel)) {
				channel = channel.substr(1);
				data.__args = Array.prototype.slice.call(arguments, 2);
			} else {
				data.__args = Array.prototype.slice.call(arguments, 1);
				command = channel;
				channel = null;
			}

			if (!channel && this instanceof postal.ChannelDefinition) {
				channel = this.channel;
			}

			return postal.publish({
				channel: channel,
				topic: '/' + command,
				data: data
			});

		};

		originPublish = postal.publish;
		// postal.publish = function(envelope) {
		// 	// если тип сообщения - команда
		// 	// определяем, если имя сообщения начинается с '/'
		// 	var promise = postal.configuration.promise.createDeferred();
		// 	envelope.headers = envelope.headers || {};

		// 	if (commandTest.test(envelope.topic)) {
		// 		envelope.headers.replyable = true;
		// 		envelope.topic = envelope.topic.substr(1);

		// 		envelope.reply = function(err, data) {
		// 			if (err)
		// 				promise[postal.configuration.promise.fail](err);
		// 			else {
		// 				promise[postal.configuration.promise.fulfill](data);
		// 			}
		// 		};
		// 	} else {
		// 		envelope.headers.replyable = false;
		// 		envelope.reply = function() {
		// 			// throw 'Type of the event is not a command';
		// 			promise[postal.configuration.promise.fail]('Type of the event is not a command');
		// 		};
		// 	}

		// 	originPublish.call(this, envelope);
		// 	return postal.configuration.promise.getPromise(promise);
		// };


		originSubscribe = sdp.subscribe;
		sdp.subscribe = function(options, callback) {

			callback = typeof options === 'function' ? options : typeof options.callback === 'function' ? options.callback : callback;
			originCallback = callback;

			callback = function(data, envelope) {
				var result,
					reply;

				//console.log(data);
				//console.log(envelope);

				if (envelope.headers && envelope.headers.replyable) {
					reply = envelope.reply;
					envelope.reply = null;

					try {
						result = originCallback.call(this, data, envelope);
						// проверяем что result - это promise
						// если есть then, то скорее всего это promise
						if (result && typeof result.then === 'function') {
							result.then(function(data) {
									reply(null, data);
								},
								function(data) {
									reply(data);
								});
						} else {
							reply(null, result);
						}

					} catch (ex) {
						reply(ex, null);
					}
				} else {
					result = originCallback.apply(this, arguments);
				}

				return result;
			};

			return originSubscribe.call(this, callback);
		};

		return postal;
	};
});
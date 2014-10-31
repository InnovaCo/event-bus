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

	var channelTest = /^@/,
		commandTest = /^\//,
		slice = Array.prototype.slice;

	return function(postal) {

		postal.configuration.promise = {
			createDeferred: function() {
				return require('jquery').Deferred();
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
		postal.publish = function(envelope) {
			// если тип сообщения - команда
			// определяем, если имя сообщения начинается с '/'
			var promise = postal.configuration.promise.createDeferred();
			envelope.headers = envelope.headers || {};

			if (commandTest.test(envelope.topic)) {
				envelope.headers.replyable = true;
				envelope.topic = envelope.topic.substr(1);

				envelope.reply = function(err, data) {
					if (err) {
						promise[postal.configuration.promise.fail](err);
					} else {
						promise[postal.configuration.promise.fulfill](data);
					}
				};
			} else {
				envelope.headers.replyable = false;
				envelope.reply = function() {
					// throw 'Type of the event is not a command';
					promise[postal.configuration.promise.fail]('Type of the event is not a command');
				};
			}

			originPublish.call(this, envelope);
			return postal.configuration.promise.getPromise(promise);
		};

		var SubscriptionDefinitionProto = postal.SubscriptionDefinition.prototype,
			originSubscribe = SubscriptionDefinitionProto.subscribe;

		SubscriptionDefinitionProto.subscribe = function() {

			var args = slice.call(arguments, 0),
				originCallback = null,

				callbackProxy = function(data, envelope) {
					if (envelope.headers && envelope.headers.replyable) {
						// если метод вызван через метод ON фасада backbode
						if (originCallback.__original && data.__args) {
							data.__args.unshift(envelope.reply);

							return originCallback.call(this, data, envelope);
						}
					}
					return originCallback.apply(this, arguments);

				};


			for (var i = 0; i < args.length; i++) {
				var arg = args[i];

				if (typeof arg === 'function') {
					originCallback = arg;
					arg = callbackProxy;
					if (originCallback.__original) {
						arg.__original = originCallback.__original;
					}
					args[i] = arg;
				} else if (arg && typeof arg.callback === 'function') {
					originCallback = arg.callback;
					arg.callback = callbackProxy;
					if (originCallback.__original) {
						arg.callback.__original = originCallback.__original;
					}
					args[i] = arg;
				}
			};
			console.log(args);
			return originSubscribe.apply(this, args);
		};


		return postal;
	};
});
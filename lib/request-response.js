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

/*jshint unused:false*/
define(function(require, exports, module) {
	var channelTest = /^@/,
		commandTest = /^\//,
		deferred = require('pledges').deferred;

	return function(postal) {

		function request(channel, command) {
			var
				defer = deferred(),
				promise = defer,
				data = {
					__args: null
				};

			if (typeof channel !== 'string') {
				return promise;
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

			function resolve(data) {
				defer.resolve(data);
			}

			function reject(reason) {
				defer.reject(reason);
			}

			function reply(err, data) {
				if (err) {
					reject(err);
				} else {
					resolve(data);
				}
			}

			reply.resolve = resolve;
			reply.reject = reject;

			postal.publish({
				channel: channel,
				topic: command,
				data: data,
				reply: reply,
				headers: {
					replyable: true
				}
			});

			return promise;
		}

		postal.request = request;

		postal.ChannelDefinition.prototype.request = request;

		var SubscriptionDefinitionProto = postal.SubscriptionDefinition.prototype,
			originSubscribe = SubscriptionDefinitionProto.subscribe;

		SubscriptionDefinitionProto.subscribe = function(originCallback) {

			function callbackProxy(data, envelope) {
				if (envelope.headers && envelope.headers.replyable) {
					try {
						// если метод вызван через метод ON фасада backbode
						if (originCallback.__original && data.__args) {
							data.__args.unshift(envelope.reply);
						}

						return originCallback.call(this, data, envelope);
					} catch (ex) {
						//console.log(ex);
						envelope.reply(ex);
					}
				}
				return originCallback.apply(this, arguments);

			}

			//в случае если подписались через метод ON
			// сохраняем __original для отписки
			if (originCallback.__original) {
				callbackProxy.__original = originCallback.__original;
			}

			return originSubscribe.call(this, callbackProxy);
		};

		return postal;
	};
});
var assert = require('assert');
var bus = require('../');

describe('Backbone facade', function() {
	it('global subscribe', function() {
		var a = 1;
		bus.on('test', function(data) {
			a = data;
		});
		bus.trigger('test', 2);
		assert.equal(a, 2);

		// подписываемся на канал
		bus.on('my-channel', 'test', function(data) {
			a = data;
		});
		bus.trigger('my-channel', 'test', 3);
		assert.equal(a, 3);
	});

	it('global unsubscribe', function() {
		var a = 1;
		bus.on('test', function(data) {
			a = data;
		});
		bus.off('test');
		bus.trigger('test', 2);
		assert.equal(a, 1);

		// отписываем все события от канала
		bus.on('my-channel', 'test', function(data) {
			a = data;
		});

		bus.off('my-channel', 'test');
		bus.trigger('my-channel', 'test', 3);
		assert.equal(a, 1);

		// отписываем только конкретный обработчик
		var cb = function() {
			a += 1;
		};
		bus.on('test', function() {a += 1;});
		bus.on('test', cb);

		bus.off('test', cb);
		bus.trigger('test');
		assert.equal(a, 2);
	});

	it('global trigger', function() {
		var a = 1, b = 1;
		bus.on('test', function(data) {
			a += data;
		});
		bus.on('my-channel', 'test', function(data) {
			b += data;
		});

		bus.trigger('test', 2);
		assert.equal(a, 3);
		assert.equal(b, 1);

		bus.trigger('my-channel', 'test', 2);
		assert.equal(a, 3);
		assert.equal(b, 3);
	});

	it('channel subscribe', function() {
		var a = 1;
		var channel = bus.channel('my-channel');
		bus.on('test', function(data) {
			a += data;
		});
		channel.on('test', function(data) {
			a += data;
		});

		channel.trigger('test', 2);
		assert.equal(a, 3);
	});

	it('channel unsubscribe', function() {
		var a = 1;
		var channel = bus.channel('my-channel');
		channel.on('test', function(data) {
			a += data;
		});

		channel.off('test');

		bus.trigger('my-channel', 'test', 2);
		assert.equal(a, 1);

		// отписываем конкретный слушатель
		var cb = function(data) {
			a += data;
		};
		channel.on('test', function(data) {
			a += data;
		});
		channel.on('test', cb);
		bus.trigger('my-channel', 'test', 2);
		assert.equal(a, 5);
		
		channel.off('test', cb);
		bus.trigger('my-channel', 'test', 2);
		assert.equal(a, 7);
	});
});
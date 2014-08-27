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

describe('Backbone compatibility tests', function() {
	it('on and trigger', function() {
		var obj = { counter: 0 };

		bus.on('event', function() { obj.counter += 1; });
		bus.trigger('event');
		assert.equal(obj.counter, 1, 'counter should be incremented.');
		bus.trigger('event');
		bus.trigger('event');
		bus.trigger('event');
		bus.trigger('event');
		assert.equal(obj.counter, 5, 'counter should be incremented five times.');
	});

	it('binding and triggering multiple events', function() {
		var obj = { counter: 0 };

		bus.on('a b c', function() { obj.counter += 1; });

		bus.trigger('a');
		assert.equal(obj.counter, 1);

		bus.trigger('a b');
		assert.equal(obj.counter, 3);

		bus.trigger('c');
		assert.equal(obj.counter, 4);

		bus.off('a c');
		bus.trigger('a b c');
		assert.equal(obj.counter, 5);
	});

	it('on, then unbind all functions', function() {
		var obj = { counter: 0 };
		var callback = function() { obj.counter += 1; };
		bus.on('event', callback);
		bus.trigger('event');
		bus.off('event');
		bus.trigger('event');
		assert.equal(obj.counter, 1, 'counter should have only been incremented once.');
	});

	it('bind two callbacks, unbind only one', function() {
		var obj = { counterA: 0, counterB: 0 };
		var callback = function() { obj.counterA += 1; };
		bus.on('event', callback);
		bus.on('event', function() { obj.counterB += 1; });
		bus.trigger('event');
		bus.off('event', callback);
		bus.trigger('event');
		assert.equal(obj.counterA, 1, 'counterA should have only been incremented once.');
		assert.equal(obj.counterB, 2, 'counterB should have been incremented twice.');
	});

	it('unbind a callback in the midst of it firing', function() {
		var obj = {counter: 0};
		var callback = function() {
			obj.counter += 1;
			bus.off('event', callback);
		};
		bus.on('event', callback);
		bus.trigger('event');
		bus.trigger('event');
		bus.trigger('event');
		assert.equal(obj.counter, 1, 'the callback should have been unbound.');
	});

	it('two binds that unbind themeselves', function() {
		var obj = { counterA: 0, counterB: 0 };
		var incrA = function(){ obj.counterA += 1; bus.off('event', incrA); };
		var incrB = function(){ obj.counterB += 1; bus.off('event', incrB); };
		bus.on('event', incrA);
		bus.on('event', incrB);
		bus.trigger('event');
		bus.trigger('event');
		bus.trigger('event');
		assert.equal(obj.counterA, 1, 'counterA should have only been incremented once.');
		assert.equal(obj.counterB, 1, 'counterB should have only been incremented once.');
	});

	it('bind a callback with a supplied context', function(done) {
		var TestClass = function () {
			return this;
		};

		TestClass.prototype.assertTrue = function() {
			done();
		};

		bus.on('event', function () { this.assertTrue(); }, (new TestClass));
		bus.trigger('event');
		bus.off('event');
	});

	it('remove all events for a specific context', function() {
		var obj = { counterA: 0, counterB: 0 };
		bus.on('x y', function() { obj.counterA += 1; });
		bus.on('x y', function() { obj.counterB += 1; }, obj);
		bus.off(null, null, obj);
		bus.trigger('x y');
		assert.equal(obj.counterA, 2, 'counterA should have been incremented twice.');
		assert.equal(obj.counterB, 0, 'the callback should have been unbound.');
	});

	it('remove all events for a specific callback', function() {
		var obj = { counterA: 0, counterB: 0 };
		var success = function() { obj.counterA += 1; };
		var fail = function() { obj.counterB += 1; };
		bus.on('x y', success);
		bus.on('x y', fail);
		bus.off(null, fail);
		bus.trigger('x y');
		assert.equal(obj.counterA, 2, 'counterA should have been incremented twice.');
		assert.equal(obj.counterB, 0, 'the callback should have been unbound.');
	});
});
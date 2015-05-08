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
		bus.on('@my-channel', 'test', function(data) {
			a = data;
		});
		bus.trigger('@my-channel', 'test', 3);
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
		bus.on('@my-channel', 'test', function(data) {
			a = data;
		});

		bus.off('@my-channel', 'test');
		bus.trigger('@my-channel', 'test', 3);
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

	it('global data transfer', function() {
		var a = 'hello',
			b = 1,
			c = { d: 1 },
			count = 0;

		bus.on('data', function(data) {
			switch (typeof data) {
				case 'string':
					a += ' ' + data;
					break;
				case 'number':
					b += data;
					break;
				case 'object':
					for (var key in data) {
						c[key] = data[key];
					}
					break;
				default:
					count++;
			}
		});

		bus.trigger('data', 'world');
		bus.trigger('data', 2);
		bus.trigger('data', { e: 2 });
		bus.trigger('data');

		assert.equal(a, 'hello world');
		assert.equal(b, 3);
		assert.equal(Object.keys(c).length, 2);
		assert.equal(count, 1);
	});

	it('global trigger', function() {
		var a = 1, b = 1;
		bus.on('test', function(data) {
			a += data;
		});
		bus.on('@my-channel', 'test', function(data) {
			b += data;
		});

		bus.trigger('test', 2);
		assert.equal(a, 3);
		assert.equal(b, 1);

		bus.trigger('@my-channel', 'test', 2);
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

		bus.trigger('@my-channel', 'test', 2);
		assert.equal(a, 1);

		// отписываем конкретный слушатель
		var cb = function(data) {
			a += data;
		};
		channel.on('test', function(data) {
			a += data;
		});
		channel.on('test', cb);
		bus.trigger('@my-channel', 'test', 2);
		assert.equal(a, 5);

		channel.off('test', cb);
		bus.trigger('@my-channel', 'test', 2);
		assert.equal(a, 7);
	});

	it('channel data transfer', function() {
		var a = 'hello',
			b = 1,
			c = { d: 1 },
			count = 0;

		var channel = bus.channel('data-channel');

		channel.on('data', function(data) {
			switch (typeof data) {
				case 'string':
					a += ' ' + data;
					break;
				case 'number':
					b += data;
					break;
				case 'object':
					for (var key in data) {
						c[key] = data[key];
					}
					break;
				default:
					count++;
			}
		});

		bus.trigger('@data-channel', 'data', 'world');
		bus.trigger('@data-channel', 'data', 2);
		bus.trigger('@data-channel', 'data', { e: 2 });
		bus.trigger('@data-channel', 'data');

		assert.equal(a, 'hello world');
		assert.equal(b, 3);
		assert.equal(Object.keys(c).length, 2);
		assert.equal(count, 1);
	});

	it('on channel data transfer', function() {
		var a = 'hello',
			b = 1,
			c = { d: 1 },
			count = 0;

		var channel = bus.channel('data-channel');

		function handler(data) {
			switch (typeof data) {
				case 'string':
					a += ' ' + data;
					break;
				case 'number':
					b += data;
					break;
				case 'object':
					for (var key in data) {
						c[key] = data[key];
					}
					break;
				default:
					count++;
			}
		}

		bus.on('data', handler);
		channel.on('data', handler);

		channel.trigger('data', 'world');
		channel.trigger('data', 2);
		channel.trigger('data', { e: 2 });
		channel.trigger('data');

		assert.equal(a, 'hello world');
		assert.equal(b, 3);
		assert.equal(Object.keys(c).length, 2);
		assert.equal(count, 1);
	});
});

describe('Backbone compatibility tests', function() {
	it('on and trigger', function() {
		var obj = { counter: 0 };
		var eventEmiter = bus.channel('test1');

		eventEmiter.on('event', function() { obj.counter += 1; });
		eventEmiter.trigger('event');
		assert.equal(obj.counter, 1, 'counter should be incremented.');

		eventEmiter.trigger('event');
		eventEmiter.trigger('event');
		eventEmiter.trigger('event');
		eventEmiter.trigger('event');
		assert.equal(obj.counter, 5, 'counter should be incremented five times.');
	});

	it('binding and triggering multiple events', function() {
		var obj = { counter: 0 };
		var eventEmiter = bus.channel('test2');

		eventEmiter.on('a b c', function() { obj.counter += 1; });

		eventEmiter.trigger('a');
		assert.equal(obj.counter, 1);

		eventEmiter.trigger('a b');
		assert.equal(obj.counter, 3);

		eventEmiter.trigger('c');
		assert.equal(obj.counter, 4);

		eventEmiter.off('a c');
		eventEmiter.trigger('a b c');
		assert.equal(obj.counter, 5);
	});

	it('trigger all for each event', function() {
		var a, b, obj = { counter: 0 };
		var eventEmiter = bus.channel('test3');

		eventEmiter.on('all', function(event) {
			obj.counter++;
			if (event == 'a') a = true;
			if (event == 'b') b = true;
		})
		.trigger('a b');

		assert.equal(a, true);
		assert.equal(b, true);
		assert.equal(obj.counter, 2);
	});

	it('on, then unbind all functions', function() {
		var obj = { counter: 0 };
		var eventEmiter = bus.channel('test4');
		var callback = function() { obj.counter += 1; };

		eventEmiter.on('event', callback);
		eventEmiter.trigger('event');
		eventEmiter.off('event');
		eventEmiter.trigger('event');
		assert.equal(obj.counter, 1, 'counter should have only been incremented once.');
	});

	it('bind two callbacks, unbind only one', function() {
		var obj = { counterA: 0, counterB: 0 };
		var eventEmiter = bus.channel('test5');
		var callback = function() { obj.counterA += 1; };

		eventEmiter.on('event', callback);
		eventEmiter.on('event', function() { obj.counterB += 1; });
		eventEmiter.trigger('event');
		eventEmiter.off('event', callback);
		eventEmiter.trigger('event');
		assert.equal(obj.counterA, 1, 'counterA should have only been incremented once.');
		assert.equal(obj.counterB, 2, 'counterB should have been incremented twice.');
	});

	it('unbind a callback in the midst of it firing', function() {
		var obj = {counter: 0};
		var eventEmiter = bus.channel('test6');
		var callback = function() {
			obj.counter += 1;
			eventEmiter.off('event', callback);
		};

		eventEmiter.on('event', callback);
		eventEmiter.trigger('event');
		eventEmiter.trigger('event');
		eventEmiter.trigger('event');
		assert.equal(obj.counter, 1, 'the callback should have been unbound.');
	});

	it('two binds that unbind themeselves', function() {
		var obj = { counterA: 0, counterB: 0 };
		var eventEmiter = bus.channel('test7');
		var incrA = function(){ obj.counterA += 1; eventEmiter.off('event', incrA); };
		var incrB = function(){ obj.counterB += 1; eventEmiter.off('event', incrB); };

		eventEmiter.on('event', incrA);
		eventEmiter.on('event', incrB);
		eventEmiter.trigger('event');
		eventEmiter.trigger('event');
		eventEmiter.trigger('event');
		assert.equal(obj.counterA, 1, 'counterA should have only been incremented once.');
		assert.equal(obj.counterB, 1, 'counterB should have only been incremented once.');
	});

	it('bind a callback with a supplied context', function(done) {
		var TestClass = function () {
			return this;
		};
		var eventEmiter = bus.channel('test8');

		TestClass.prototype.assertTrue = function() {
			done();
		};

		eventEmiter.on('event', function () { this.assertTrue(); }, (new TestClass));
		eventEmiter.trigger('event');
		eventEmiter.off('event');
	});

	it('callback list is not altered during trigger', function() {
		var counter = 0;
		var eventEmiter = bus.channel('test9');
		var incr = function(){ counter++; };

		eventEmiter.on('event', function(){ eventEmiter.on('event', incr).on('all', incr); })
		.trigger('event');
		assert.equal(counter, 0, 'bind does not alter callback list');

		eventEmiter.off()
		.on('event', function(){ eventEmiter.off('event', incr).off('all', incr); })
		.on('event', incr)
		.on('all', incr)
		.trigger('event');

		assert.equal(counter, 2, 'unbind does not alter callback list');
	});

	it('remove all events for a specific context', function() {
		var obj = { counterA: 0, counterB: 0 };
		var eventEmiter = bus.channel('test10');

		eventEmiter.on('x y', function() { obj.counterA += 1; });
		eventEmiter.on('x y', function() { obj.counterB += 1; }, obj);
		eventEmiter.off(null, null, obj);
		eventEmiter.trigger('x y');
		assert.equal(obj.counterA, 2, 'counterA should have been incremented twice.');
		assert.equal(obj.counterB, 0, 'the callback should have been unbound.');
	});

	it('remove all events for a specific callback', function() {
		var obj = { counterA: 0, counterB: 0 };
		var eventEmiter = bus.channel('test11');
		var success = function() { obj.counterA += 1; };
		var fail = function() { obj.counterB += 1; };

		eventEmiter.on('x y', success);
		eventEmiter.on('x y', fail);
		eventEmiter.off(null, fail);
		eventEmiter.trigger('x y');
		assert.equal(obj.counterA, 2, 'counterA should have been incremented twice.');
		assert.equal(obj.counterB, 0, 'the callback should have been unbound.');
	});
});
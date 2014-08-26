var assert = require('assert');
var bus = require('../index');

describe('Data preserve', function() {
	it('default events', function() {
		var a = 1;
		bus.on('test', function(data) {
			a += data;
		});
		bus.trigger('test', 2);
		// подписались на событие после триггера: ничего не делаем
		bus.on('test', function(data) {
			a += data;
		});

		assert(a, 3);
	});

	it('persistent events', function(done) {
		var a = 1, b = 1;
		bus.on('test', function(data) {
			a += data;
		});
		bus.trigger('!test', 2);
		// подписались на событие после триггера форсированного
		// события — вызовем его
		bus.on('test', function(data) {
			a += data;
			b += data;
		});

		setTimeout(function() {
			assert.equal(a, 5);
			assert.equal(b, 3);

			bus.trigger('test', 2);

			// подписались после обычного события: ничего не делаем
			bus.on('test', function(data) {
				a += data;
				b += data;
			});

			setTimeout(function() {
				assert.equal(a, 9);
				assert.equal(b, 5);
				done();
			}, 100);
		}, 100);
	});
});
var assert = require('assert');
var mockery = require('mockery');
mockery.enable();
mockery.registerMock('jquery', {});

var bus = require('../index');
var defer = require('q');

describe('request-response events.', function() {

	beforeEach(function() {
		bus.off('reject');
		bus.off('resolve');

		bus.unsubscribeFor({
			topic: 'reject'
		});

		bus.unsubscribeFor({
			topic: 'resolve'
		})
	});

	it('using request/on', function(done) {

		bus
			.on('resolve', function(reply, arg1, arg2) {
				reply(null, 1 + arg1 + arg2);
			})
			.on('reject', function(reply, arg1, arg2) {
				reply(1 + arg1 + arg2);
			});

		var resolvePromise = bus.request('resolve', 2, 3).then(function(value) {
				assert.equal(value, 6);
				return value;
			},
			function() {
				return defer.reject('Promise should be resolved');
			});

		var rejectPromise = bus.request('reject', 2, 3).then(function(value) {
				return defer.reject('Promise should be rejected');
			},
			function(value) {
				assert.equal(value, 6);
				return value;
			});

		defer.all([resolvePromise, rejectPromise]).then(function(val) {
			done();
		}, function(reason) {
			done(reason);
		});
	});

	it('using request/sub', function(done) {

		bus.subscribe({
			topic: 'resolve',
			callback: function(data, env) {
				env.reply.resolve(1 + data.args[0] + data.args[1]);
			}
		});

		bus.subscribe({
			topic: 'reject',
			callback: function(data, env) {
				env.reply(1 + data.args[0] + data.args[1]);
			}
		});

		var resolvePromise = bus.request('resolve', 2, 3).then(function(value) {
			assert.equal(value, 6);
			return value;
		}, function() {
			return defer.reject('Promise should be resolved');
		});

		var rejectPromise = bus.request('reject', 2, 3).then(function(value) {
			return defer.reject('Promise should be rejected');
		}, function(value) {
			assert.equal(value, 6);
			return value;
		});

		defer.all([resolvePromise, rejectPromise]).then(function(val) {
			done();
		}, function(reason) {
			done(reason);
		});
	});

});
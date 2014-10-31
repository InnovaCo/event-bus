var assert = require('assert');
var mockery = require('mockery');
mockery.enable();
mockery.registerMock('jquery', {});

var bus = require('../index');
var defer = require('q');

describe('request-response events.', function() {

	bus.configuration.promise = {
		createDeferred: function() {
			return defer.defer();
		},
		getPromise: function(promise) {
			return promise.promise;
		},
		fulfill: "resolve",
		fail: "reject",
	};

	beforeEach(function(done) {
		bus.off('reject');
		bus.off('resolve');
		done();
	});

	it('using request/on', function(done) {

		bus
			.on('resolve', function(reply, arg1, arg2) {
				reply(null, 1 + arg1 + arg2);
			})
			.on('reject', function(reply, arg1, arg2) {
				reply(1 + arg1 + arg2);
			});


		bus.request('resolve', 2, 3).then(function(value) {
			assert.equal(value, 6);
		}, function() {
			done('Promise should be resolved');
		});

		bus.request('reject', 2, 3).then(function(value) {
				done('Promise should be rejected');
			},
			function() {
				assert.equal(value, 6);
			});

		done();
	});

	it('using request/sub', function(done) {

		bus.subscribe({
			topic: 'resolve',
			callback: function(reply, arg1, arg2) {
				reply(null, 1 + arg1 + arg2);
			}
		});

		bus.subscribe('reject', function(reply, arg1, arg2) {
			reply(1 + arg1 + arg2);
		});


		bus.request('resolve', 2, 3).then(function(value) {
			assert.equal(value, 6);
		}, function() {
			done('Promise should be resolved');
		});

		bus.request('reject', 2, 3).then(function(value) {
				done('Promise should be rejected');
			},
			function() {
				assert.equal(value, 6);
			});

		done();
	});

	it(' using pub/sub', function(done) {

		bus.subscribe({
			topic: 'resolve',
			callback: function(data, env) {
				env.reply(null, 1 + data);
			}
		});

		bus.subscribe({
			topic: 'reject',
			callback: function(data, env) {
				env.reply(1 + data);
			}
		});

		bus.publish({
			topic: '/resolve',
			data: 2
		}).then(function(value) {
			assert.equal(value, 3);
		}, function() {
			done('Promise should be resolved');
		});

		bus.publish({
			topic: '/reject',
			data: 2
		}).then(function(value) {
			done('Promise should be rejected');
		}, function() {
			assert.equal(value, 3);
		});

	});

	it('Reject promise using /sub', function(done) {
		done('no actual');
		bus.subscribe({
			topic: 'command',
			callback: function(data, env) {
				env.reply(1 + data);
			}
		});

		bus.publish({
			topic: '/command',
			data: 1
		}).then(function() {
			done('Promise should be rejected');
		}, function(value) {
			assert.equal(value, 2);
			done();
		});
	});
});
var assert = require('assert');
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

	it('Resolve promise using request/on', function(done) {

		bus.on('command', function(arg1) {
			console.log('111111');
			return 1 + arg1;
		});

		bus.request('/command', 2).then(function(value) {
			assert.equal(value, 3);
			done();
		}, function() {
			done('Promise should be resolved');
		});
	});

	it('Reject promise using request/on', function(done) {

		bus.on('command', function(args) {
			throw 1 + args[0];
		});

		bus.request('/command', 2).then(function() {
			done('Promise should be rejected');
		}, function(value) {
			assert.equal(value, 3);
			done();
		});
	});

	it('Resolve promise using pub/sub', function(done) {

		bus.subscribe({
			topic: 'command',
			callback: function(env) {
				return 1 + env.data;
			}
		});

		bus.publish({
			topic: '/command',
			data: 2
		}).then(function(value) {
			assert.equal(value, 3);
			done();
		}, function() {
			done('Promise should be resolved');
		});
	});

	it('Reject promise using request/on', function(done) {

		bus.subscribe({
			topic: 'command',
			callback: function(env) {
				throw 1 + env.data;
			}
		});

		console.log(bus.publish);

		bus.publish({
			topic: '/command',
			data: 1
		}).then(function() {
			done('Promise should be rejected');
		}, function(value) {
			assert.equal(value, 3);
			done();
		});
	});

	it('Resolve promise using returning promise', function(done) {

		bus.on('command', function(arg1) {
			promise = bus.configuration.promise.createDeferred();
			promise[postal.configuration.promise.fulfill](1 + arg1);
			return postal.configuration.promise.getPromise(promise);
		});

		bus.request('/command', 2).then(function(value) {
			assert.equal(value, 3);
			done();
		}, function() {
			done('Promise should be resolved');
		});
	});

	it('Reject promise using returning promise', function(done) {

		bus.on('command', function(arg1) {
			promise = bus.configuration.promise.createDeferred();
			promise[postal.configuration.promise.fail](1 + arg1);
			return postal.configuration.promise.getPromise(promise);
		});

		bus.request('/command', 2).then(function(value) {
			assert.equal(value, 3);
			done();
		}, function() {
			done('Promise should be resolved');
		});
	});

});
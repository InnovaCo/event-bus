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
		bus.off('command');
		done();
	});

	it('Resolve promise using request/on', function(done) {

		bus.on('command', function(arg1) {
			return 1 + arg1;
		});

		bus.request('command', 2).then(function(value) {
			assert.equal(value, 3);
			done();
		}, function() {
			done('Promise should be resolved');
		});
	});

	it('Reject promise using request/on', function(done) {

		bus.on('command', function(arg) {
			throw 1 + arg;
		});

		bus.request('command', 2).then(function() {
			done('Promise should be rejected');
		}, function(value) {
			assert.equal(value, 3);
			done();
		});
	});

	it('Resolve promise using pub/sub', function(done) {

		bus.subscribe({
			topic: 'command',
			callback: function(data, env) {
				return 1 + data;
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
			callback: function(data, env) {
				throw 1 + data;
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

	it('Resolve promise using returning promise', function(done) {

		bus.on('command', function(arg1) {
			promise = bus.configuration.promise.createDeferred();
			promise[bus.configuration.promise.fulfill](1 + arg1);
			return bus.configuration.promise.getPromise(promise);
		});

		bus.request('command', 2).then(function(value) {
			assert.equal(value, 3);
			done();
		}, function() {
			done('Promise should be resolved');
		});
	});

	it('Reject promise using returning promise', function(done) {

		bus.on('command', function(arg1) {
			promise = bus.configuration.promise.createDeferred();
			promise[bus.configuration.promise.fail](1 + arg1);
			return bus.configuration.promise.getPromise(promise);
		});

		bus.request('command', 2).then(function(value) {
			done('Promise should be resolved');
		}, function(value) {
			assert.equal(value, 3);
			done();
		});
	});

});
if (typeof module === 'object' && typeof define !== 'function') {
	var define = function (factory) {
		module.exports = factory(require, exports, module);
	};
}

define(function(require, exports, module) {
	var _ = require('lodash');
	var postal = require('postal');
	var facade = require('./lib/backbone-facade');

	_.extend(postal.ChannelDefinition.prototype, facade);
	return _.extend(postal, facade);
});
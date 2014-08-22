if (typeof module === 'object' && typeof define !== 'function') {
	var define = function (factory) {
		module.exports = factory(require, exports, module);
	};
}

define(function(require, exports, module) {
	var postal = require('postal');
	var facade = require('./lib/backbone-facade');
	var preserve = require('./lib/preserve');

	function extend(obj) {
		for (var i = 1, il = arguments.length, src; i < il; i++) {
			src = arguments[i];
			if (!src) {
				continue;
			}

			for (var p in src) if (src.hasOwnProperty(p)) {
				obj[p] = src[p];
			}
		}

		return obj;
	}

	extend(postal.ChannelDefinition.prototype, facade);
	return extend(preserve(postal), facade);
});
(function (root, factory) {
	if (typeof module === 'object' && module.exports) {
		// Node, or CommonJS-Like environments
		module.exports = factory();
	} else if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define('eventBus', factory);
	} else {
		// Browser globals
		root.eventBus = factory();
	}
}(this, function () {
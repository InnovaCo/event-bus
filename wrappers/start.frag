(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		define('eventBus', ['lodash'], factory);
	} else {
		root.eventBus = factory(root._);
	}
}(this, function (_) {
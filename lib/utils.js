var ArrayProto = Array.prototype,
	ObjProto = Object.prototype,
	/*jshint -W079 */
	hasOwnProperty = ObjProto.hasOwnProperty,
	nativeForEach = ArrayProto.forEach,
	slice = ArrayProto.slice,
	breaker = false;

module.exports = {
	has: function(obj, key) {
		return hasOwnProperty.call(obj, key);
	},

	each: function(obj, iterator, context) {
		if (obj == null) {
			return;
		}

		if (nativeForEach && obj.forEach === nativeForEach) {
			obj.forEach(iterator, context);
		} else if (obj.length === +obj.length) {
			for (var i = 0, l = obj.length; i < l; i++) {
				if (iterator.call(context, obj[i], i, obj) === breaker) {
					return;
				}
			}
		} else {
			for (var key in obj) {
				if (this.has(obj, key)) {
					if (iterator.call(context, obj[key], key, obj) === breaker) {
						return;
					}
				}
			}
		}
	},

	extend: function(obj) {
		/* jshint forin: false */
		this.each(slice.call(arguments, 1), function(source) {
			if (source) {
				for (var prop in source) {
					obj[prop] = source[prop];
				}
			}
		});
		return obj;
	}
};
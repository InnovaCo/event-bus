var gulp = require('gulp');
var uglify = require('gulp-uglify');
var rjs = require('gulp-requirejs');

gulp.task('js', function() {
	return rjs({
			baseUrl: './',
			name: 'lib/almond',
			include: ['./index'],
			optimize: 'none',
			out: 'event-bus.js',
			paths: {
				postal: './node_modules/postal/lib/postal',
				lodash: './node_modules/postal/node_modules/lodash/lodash',
				conduitjs: './node_modules/postal/node_modules/conduitjs/lib/conduit'
			},
			wrap: {
				start: 'var eventBus = (function() {',
				end: ';return require(\'index\');})();'
			}
		})
		.pipe(uglify())
		.pipe(gulp.dest('./out'));
});

gulp.task('js-minimal', function() {
	return rjs({
			baseUrl: './',
			name: 'eventBus',
			exclude: ['lodash', 'conduitjs'],
			optimize: 'none',
			out: 'event-bus-mini.js',
			paths: {
				eventBus: './index',
				postal: './node_modules/postal/lib/postal',
				lodash: './node_modules/postal/node_modules/lodash/lodash',
				conduitjs: './node_modules/postal/node_modules/conduitjs/lib/conduit'
			}
		})
		.pipe(uglify())
		.pipe(gulp.dest('./out'));
});

gulp.task('default', ['js', 'js-minimal']);
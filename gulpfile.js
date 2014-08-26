var gulp = require('gulp'),
	uglify = require('gulp-uglify'),
	rjs = require('gulp-requirejs'),
	_ = require('underscore');

var buildOptions = {
		baseUrl: './',
		name: './node_modules/almond/almond',
		paths: {
			'conduitjs': './node_modules/postal/node_modules/conduitjs/lib/conduit',
			'postal': './node_modules/postal/lib/postal',
			'lodash': 'empty:'
		},
		include: ['index'],
		almond: true,
		wrap: {
			startFile: './wrappers/start.frag',
			endFile: './wrappers/end.frag'
		},
		optimize: 'none',
		out: 'event-bus.js'
	};

gulp.task('rjs:dev', function() {
	return rjs(buildOptions).pipe(gulp.dest('./out'));
});

gulp.task('rjs:live', function() {
	return rjs(_.extend({}, buildOptions, {
		preserveLicenseComments: false,
		out: 'event-bus.min.js'
	}))
	.pipe(uglify())
	.pipe(gulp.dest('./out'));
});

gulp.task('default', ['rjs:dev', 'rjs:live']);
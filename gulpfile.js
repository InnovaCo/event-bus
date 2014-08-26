var gulp = require('gulp'),
	uglify = require('gulp-uglify'),
	rjs = require('gulp-requirejs'),
	utils = require('./lib/utils');

var buildOptions = {
		baseUrl: './',
		name: './node_modules/almond/almond',
		paths: {
			'conduitjs': './node_modules/postal/node_modules/conduitjs/lib/conduit',
			'postal': './node_modules/postal/lib/postal',
			'lodash': './node_modules/lodash/lodash'
		},
		include: ['index'],
		almond: true,
		wrap: {
			startFile: './wrappers/standalone/start.frag',
			endFile: './wrappers/standalone/end.frag'
		},
		optimize: 'none',
		out: 'event-bus.js'
	};

gulp.task('standalone:dev', function() {
	return rjs(buildOptions).pipe(gulp.dest('./out'));
});

gulp.task('standalone:live', function() {
	return rjs(utils.extend({}, buildOptions, {
		preserveLicenseComments: false,
		out: 'event-bus.min.js'
	}))
	.pipe(uglify())
	.pipe(gulp.dest('./out'));
});

gulp.task('base:dev', function() {
	return rjs(utils.extend({}, buildOptions, {
		paths: utils.extend({}, buildOptions.paths, {
			'lodash': 'empty:'
		}),
		wrap: {
			startFile: './wrappers/base/start.frag',
			endFile: './wrappers/base/end.frag'
		},
		out: 'event-bus-base.js'
	})).pipe(gulp.dest('./out'));
});

gulp.task('base:live', function() {
	return rjs(utils.extend({}, buildOptions, {
		paths: utils.extend({}, buildOptions.paths, {
			'lodash': 'empty:'
		}),
		wrap: {
			startFile: './wrappers/base/start.frag',
			endFile: './wrappers/base/end.frag'
		},
		preserveLicenseComments: false,
		out: 'event-bus-base.min.js'
	}))
	.pipe(uglify())
	.pipe(gulp.dest('./out'));
});

gulp.task('default', ['standalone:dev', 'standalone:live', 'base:dev', 'base:live']);
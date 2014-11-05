var gulp = require('gulp'),
	uglify = require('gulp-uglify'),
	rjs = require('gulp-requirejs'),
	rename = require('gulp-rename'),
	merge = require('merge'),
	jshint = require('gulp-jshint');

var DEST = './out';

var buildOptions = {
	baseUrl: './',
	name: './node_modules/almond/almond',
	paths: {
		'conduitjs': './node_modules/postal/node_modules/conduitjs/lib/conduit',
		'postal': './node_modules/postal/lib/postal',
		'lodash': './node_modules/postal/node_modules/lodash/lodash',
		'pledges': './node_modules/pledges/build/release.min',
	},
	include: ['index'],
	almond: true,
	wrap: {
		startFile: './wrappers/standalone/start.frag',
		endFile: './wrappers/standalone/end.frag'
	},
	optimize: 'none',
	preserveLicenseComments: false,
	out: 'event-bus.js'
};

/**
 * Сборка standalone-версии без каких-либо зависимостей:
 * файл можно просто вставить на страницу как скрипт
 */
gulp.task('standalone', function() {
	return rjs(buildOptions)
		.pipe(gulp.dest(DEST))
		.pipe(rename('event-bus.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest(DEST));
});

/**
 * Сборка версии для Require.js: содержит только внутренние
 * зависимости, а внешние (типа Conduit и Lo-Dash) в сборку
 * не включаются. Также ссылки на эти внешние модули
 * переименовываются: к ним добавляется `packages/`
 */
gulp.task('requirejs', function() {
	return rjs(merge.recursive(true, buildOptions, {
			paths: {
				'lodash': 'empty:'
			},
			wrap: {
				startFile: './wrappers/requirejs/start.frag',
				endFile: './wrappers/requirejs/end.frag'
			},
			out: 'event-bus-requirejs.js'
		}))
		.pipe(gulp.dest(DEST))
		.pipe(rename('event-bus-requirejs.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest(DEST));
});

gulp.task('lint', function(argument) {
	return gulp.src('./lib/*.js')
		.pipe(jshint())
		.pipe(jshint.reporter('default'))
});

gulp.task('default', ['lint', 'standalone', 'requirejs']);
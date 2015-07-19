"use strict";

var gulp = require('gulp'),
	sass = require('gulp-ruby-sass'),
	rename = require('gulp-rename'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify'),
	livereload = require('gulp-livereload');

var onError = function(err) {
	console.log(err);
}

gulp.task('watch', function() {
	livereload.listen();
	gulp.watch(['app/sass/*.sass','app/sass/templates/*.sass',], ['sass']);
	gulp.watch(['app/js/main.js'], ['scripts']);
});

// copy boilerplate

gulp.task('boilerplate', function() {
	gulp.src("I:/EveryD front-end/templates/html5-boilerplate_v5.0.0 (ed'd)/**")
	.pipe(gulp.dest("./"));
});

// sass

gulp.task('templates', function() {
	return gulp.src('./app/sass/templates/*.sass')
	.pipe(concat('templates.sass'))
	.pipe(gulp.dest('./app/sass'));
});

gulp.task('sass', ['templates'], function() {
	return sass('./app/sass/main.sass', { style: 'compressed' })
	.pipe(rename('bundle.min.css'))
	.pipe(gulp.dest('./app/css'))
	.pipe(livereload());
});

// scripts

gulp.task('plugins', function() {
	return gulp.src('./app/js/plugins/*.js')
	.pipe(concat('plugins.min.js'))
	.pipe(uglify())
	.pipe(gulp.dest('./app/js'));
});

gulp.task('scripts', function() {
	return gulp.src('./app/js/main.js')
	.pipe(concat('main.min.js'))
	.pipe(uglify())
	.pipe(gulp.dest('./app/js'))
	.pipe(livereload());
});

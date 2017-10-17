/* eslint-env node */

const gulp = require('gulp');
const concat = require('gulp-concat');
const eslint = require('gulp-eslint');
const browserify = require('browserify');
const buffer = require('vinyl-buffer');
const transform = require('vinyl-transform');
const source = require('vinyl-source-stream');
const babelify = require('babelify');
const sourcemaps = require('gulp-sourcemaps');
const shell = require('gulp-shell');

gulp.task('default', ['lint', 'scripts']);
// regenerate for distribution:
gulp.task('dist', ['scripts-dist']);
// regenerate for development:
gulp.task('dev', ['scripts']);

gulp.task('lint', function () {
    gulp.src(['js/**/*.js'])
        .pipe(eslint())
        .pipe(eslint.formatEach())
        .pipe(eslint.failOnError());
});

gulp.task('scripts', function () {
    return browserify('./Site/js/main.js', {
        basedir: '.',
        debug: true,
        standalone: 'main'
    })
        .transform("babelify", {
            //compact: true,
            presets: "es2015"
        })
        .bundle()
        .on('error', function(err) {
            console.error(err);
            this.emit('end'); })
        .pipe(source('allmin.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({ loadMaps: true }))
        //.pipe(uglify())
        .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest('./Site/dist/js'));
});

gulp.task('scripts-dist', function () {
    return browserify('./Site/js/main.js', {
        debug: true,
        standalone: 'main'
    })
        .transform("babelify", {
            compact: true,
            presets: "es2015"
        })
        .bundle()
        .on('error', function(err) {
            console.error(err);
            this.emit('end'); })
        .pipe(source('allmin.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({ loadMaps: true }))
        //.pipe(uglify())
        .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest('./Site/dist/js'));
});

gulp.task('watch', function () {
    gulp.watch('src/*.js', ['lint', 'scripts']);
    gulp.watch('spec/*-spec.js', ['tests']);
});

gulp.task('tests', shell.task(['make tests']));

// end of gulpfile.js

var gulp = require('gulp');

// gulp plugins and utils
var gutil = require('gulp-util');
var livereload = require('gulp-livereload');
var postcss = require('gulp-postcss');
var sourcemaps = require('gulp-sourcemaps');
var zip = require('gulp-zip');
var uglify = require('gulp-uglify');
var filter = require('gulp-filter');

var sass = require('gulp-sass');

// postcss plugins
var autoprefixer = require('autoprefixer');
var cssnano = require('cssnano');


var swallowError = function swallowError(error) {
  gutil.log(error.toString());
  gutil.beep();
  this.emit('end');
};

var nodemonServerInit = function () {
  livereload.listen(1234);
};

function css() {
  var processors = [
    autoprefixer({browsers: ['last 2 versions']}),
    cssnano()
  ];

  return gulp.src('assets/scss/screen.scss')
    .on('error', swallowError)
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss(processors))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('assets/built/'))
    .pipe(livereload());
}

function js() {
  var jsFilter = filter(['**/*.js'], {restore: true});

  return gulp.src('assets/js/*.js')
    .on('error', swallowError)
    .pipe(sourcemaps.init())
    .pipe(jsFilter)
    .pipe(uglify())
    .pipe(jsFilter.restore)
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('assets/built/'))
    .pipe(livereload());
}

function watch() {
  gulp.watch('assets/scss/**/*.scss', css);
}

function zip() {
  var targetDir = 'dist/';
  var themeName = require('./package.json').name;
  var filename = themeName + '.zip';

  return gulp.src([
    '**',
    '!node_modules', '!node_modules/**',
    '!dist', '!dist/**'
  ])
    .pipe(zip(filename))
    .pipe(gulp.dest(targetDir));
}

exports.generate = gulp.parallel(css, js);
exports.build = gulp.series(css, js, nodemonServerInit);
exports.watch = watch;
exports.css = css;
exports.js = js;

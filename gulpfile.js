
const { src, dest, watch, series, parallel } = require('gulp'),
      sourcemaps = require('gulp-sourcemaps'),
      sass = require('gulp-sass'),
      minifyCSS  = require('gulp-clean-css'),
      concat = require('gulp-concat'),
      uglify = require('gulp-uglify'),
      nunjucksRender = require('gulp-nunjucks-render'),
      touch = require('gulp-touch-cmd'), // Timestamping removed from Gulp 4, duh!
      merge = require('merge-stream'),
      pump = require('pump'),
      fsCache = require('gulp-fs-cache'),
      changed = require('gulp-changed'),
      browserSync = require('browser-sync').create();

const watchMe = {
    scssFirstLevel: 'app/scss/**/**/*.scss',
    scssSecondLevel: 'app/scss/**/**/**/*.scss',
    scssDesignSystem: 'app/design-system/scss/**/*.scss',
    jsPath: 'app/js/lib/*.js',
    nunjucksPath: 'app/**/*.nunjucks'
}

const mainCSSDestination = 'app/css/templates/';

const jsFolders = ['app/js/lib/', 'app/js/lib/vendor/']; // For merging

function scssCriticalTask() {
  const criticalCache = fsCache('.gulp-cache/critical');
  return src('app/scss/templates/**/**/critical.scss')
    .pipe(sourcemaps.init()) // initialize sourcemaps first!
    .pipe(sass().on('error', sass.logError)) // Error log to keep session going when scss contains error
    .pipe(criticalCache)
    .pipe(minifyCSS())
    .pipe(criticalCache.restore)
    .pipe(sourcemaps.write('.')) // Write sourcemap in current directory after minifying!
    .pipe(changed(mainCSSDestination, {hasChanged: changed.compareContents}))
    .pipe(dest(mainCSSDestination))
    .pipe(browserSync.stream())
    .pipe(touch()); // Timestamp as last item as it stops stream working otherwise
}

function scssNoneCriticalTask() {
  const noneCriticalCache = fsCache('.gulp-cache/none-critical');
  return src('app/scss/templates/**/**/none-critical.scss')
    .pipe(sourcemaps.init()) // Initialize sourcemaps first!
    .pipe(sass().on('error', sass.logError)) // Error log to keep session going when scss contains error
    .pipe(noneCriticalCache)
    .pipe(minifyCSS())
    .pipe(noneCriticalCache.restore)
    .pipe(sourcemaps.write('.')) // Write sourcemap in current directory after minifying!
    .pipe(changed(mainCSSDestination, {hasChanged: changed.compareContents}))
    .pipe(dest(mainCSSDestination))
    .pipe(browserSync.stream())
    .pipe(touch()); // Timestamp as last item as it stops stream working otherwise
}

function scssDesignSystemTask() {
  return src('app/design-system/scss/**/*.scss')
    .pipe(sourcemaps.init()) // Initialize sourcemaps first
    .pipe(sass().on('error', sass.logError)) // Error log to keep session going when scss contains error
    .pipe(minifyCSS())
    .pipe(sourcemaps.write('.')) // Write sourcemap in current directory after minifying!
    .pipe(dest('app/design-system/css'))
    .pipe(browserSync.stream())
    .pipe(touch()); // Timestamp as last item as it stops stream working otherwise
}

function nunjucksTask(){
  const nunjucksDestination = 'app';
  return pump ([ // Pump is a way of grouping the pipes together (faster for this, not for CSS)
    src('app/pages/**/*.+(html|nunjucks)'),
    nunjucksRender({
        path: ['app/templates']
      }),
    changed(nunjucksDestination, {hasChanged: changed.compareContents}),
    dest(nunjucksDestination),
    browserSync.stream()
  ])
}

function jsTask() {
  const jsCache = fsCache('.gulp-cache/js');
  const jsDestination = 'app/js';
  const allTheLovelyJS = jsFolders.map(function(folder) {
    return src(folder + '*.js')
  });
  return pump ([ // Pump is a way of grouping the pipes together (faster for this, not for CSS)
    merge(allTheLovelyJS), // Merge all the lovely JS
    concat('main.js'),
    jsCache,
    uglify(),
    jsCache.restore,
    dest('app/js'),
    browserSync.stream()
  ])
}

function watchTask(done) {
  browserSync.init({
    server: {
      baseDir: "./app"
    },
    online: true
  });

  // Separate watch tasks for CSS - add as needed
  watch([watchMe.scssFirstLevel, watchMe.scssSecondLevel],
    parallel(scssCriticalTask, scssNoneCriticalTask) // Parallel kicks both off at the same time
  );

  watch(watchMe.jsPath, series(jsTask)); // Series is a bit daft here but is the right way to do it

  watch(watchMe.nunjucksPath, series(nunjucksTask));

  watch(watchMe.scssDesignSystem, series(scssDesignSystemTask));

  done(); // Signal task completion

}
// Gulp first compile - all the tasks in parallel and then the watch
exports.default = series(parallel(scssCriticalTask, scssNoneCriticalTask, scssDesignSystemTask, jsTask, nunjucksTask), watchTask);

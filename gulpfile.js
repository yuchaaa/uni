const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const sass = require('gulp-dart-sass');
const prefix = require('gulp-autoprefixer');
const cp = require('child_process');
const cleanCSS = require('gulp-clean-css');

const jekyll = process.platform === 'win32' ? 'jekyll.bat' : 'jekyll';

const paths = {
  styles: {
    src: 'assets/scss/style.scss',
    dest: 'assets/css',
    liveDest: '_site/assets/css'
  },
  watch: {
    scss: ['assets/scss/**/*.scss'],
    html: ['*.html', '_layouts/*.html', '_posts/*']
  }
};

const messages = {
  jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build'
};

// Jekyll Build
function jekyllBuild(done) {
  browserSync.notify(messages.jekyllBuild);
  return cp.spawn(jekyll, ['build'], { stdio: 'inherit' }).on('close', done);
}

// Sass Compilation
function styles() {
  return gulp.src(paths.styles.src)
    .pipe(sass().on('error', sass.logError))
    .pipe(prefix(['last 3 versions'], { cascade: true }))
    .pipe(cleanCSS())
    .pipe(gulp.dest(paths.styles.liveDest))
    .pipe(browserSync.stream())
    .pipe(gulp.dest(paths.styles.dest));
}

// BrowserSync
function browserSyncServe(done) {
  browserSync.init({
    server: {
      baseDir: '_site'
    }
  });
  done();
}

// Watch Files
function watchFiles() {
  gulp.watch(paths.watch.scss, styles);
  gulp.watch(paths.watch.html, gulp.series(jekyllBuild, reload));
}

// Reload Browser
function reload(done) {
  browserSync.reload();
  done();
}

// Composite Tasks
const build = gulp.series(styles, jekyllBuild);
const serve = gulp.series(build, browserSyncServe, watchFiles);

// Exports
exports.jekyll = jekyllBuild;
exports.styles = styles;
exports.build = build;
exports.default = serve;

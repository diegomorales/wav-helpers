const gulp = require('gulp')
const rev = require('gulp-rev')
const paths = require('./paths')

module.exports = function buildManifest () {
  const isProd = process.env.NODE_ENV === 'production'

  return gulp.src(paths.build + '**/*.{js,css}')
    .pipe(rev())
    .pipe(gulp.dest(function (file) {
      if (!isProd) {
        // Use non-rev'd asset, so it works with browsersync.
        file.path = file.revOrigPath
      }

      return file.base
    }))
    .pipe(rev.manifest())
    .pipe(gulp.dest(paths.build))
}

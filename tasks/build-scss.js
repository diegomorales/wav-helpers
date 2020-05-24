const gulp = require('gulp')
const paths = require('./paths')
const postcss = require('gulp-postcss')
const autoprefixer = require('autoprefixer')
const cssnano = require('cssnano')
const sourcemaps = require('gulp-sourcemaps')
const sass = require('gulp-sass')
const browser = require('browser-sync')

module.exports = function buildScss () {
  return gulp.src(paths.devScss + '*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass()
      .on('error', sass.logError))
    .pipe(postcss([
      autoprefixer(),
      cssnano({
        preset: [
          'default',
          {
            discardComments: {
              removeAll: true
            }
          }
        ]
      })
    ]))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.buildCss))

    // reload browser
    .pipe(browser.stream({ match: '**/*.css' }))
}

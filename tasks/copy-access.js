const gulp = require('gulp')
const paths = require('./paths')

module.exports = function copyAccess () {
  return gulp.src(paths.dev + '.htaccess')
    .pipe(gulp.dest(paths.build))
}

const { series, parallel, watch } = require('gulp')

// Tasks
const paths = require('./tasks/paths')
const startServer = require('./tasks/start-server')
const reload = require('./tasks/reload')
const cleanBuild = require('./tasks/clean-build')
// const copyAssets = require('./tasks/copy-assets')
const copyIndex = require('./tasks/copy-index')
// const buildScss = require('./tasks/build-scss')
const buildJs = require('./tasks/build-js')
// const buildSvgSprite = require('./tasks/build-svg-sprite')
// const buildManifest = require('./tasks/build-manifest')
const copyAccess = require('./tasks/copy-access')

const build = series(cleanBuild, parallel(buildJs), copyIndex)

const watchTask = series(build, () => {
  startServer()

  watch([paths.dev + 'index.html'], series(copyIndex, reload))
  // watch([paths.devScss + '**/*.scss', paths.devComponents + '**/*.scss'], buildScss)
  // watch([paths.devAssets + '**/*.*', `!${paths.devAssets}svg/*.*`], series(copyAssets, reload))
  // watch([paths.devAssets + 'svg/*.*'], series(buildSvgSprite, reload))
})

exports.build = series(build, copyAccess)
exports.default = watchTask

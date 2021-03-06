const { series, parallel, watch } = require('gulp')

// Tasks
const paths = require('./tasks/paths')
const startServer = require('./tasks/start-server')
const reload = require('./tasks/reload')
const cleanBuild = require('./tasks/clean-build')
// const copyAssets = require('./tasks/copy-assets')
const copyIndex = require('./tasks/copy-index')
const buildScss = require('./tasks/build-scss')
const buildJs = require('./tasks/build-js')
// const buildSvgSprite = require('./tasks/build-svg-sprite')
const buildManifest = require('./tasks/build-manifest')
const copyAccess = require('./tasks/copy-access')

const build = series(cleanBuild, parallel(buildJs, buildScss), buildManifest, copyIndex)

const watchTask = series(build, () => {
  startServer()

  watch([paths.devTemplates + '**/*.njk'], series(copyIndex, reload))
  watch([paths.devScss + '**/*.scss'], series(buildScss))
  // watch([paths.devAssets + '**/*.*', `!${paths.devAssets}svg/*.*`], series(copyAssets, reload))
  // watch([paths.devAssets + 'svg/*.*'], series(buildSvgSprite, reload))
})

exports.build = series(build, copyAccess)
exports.default = watchTask

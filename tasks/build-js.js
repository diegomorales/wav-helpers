const browser = require('browser-sync')
const webpack = require('webpack')
const webpackConfig = require('../webpack.config')

module.exports = function buildJs (done) {
  // A slighlty complicated way to get the hash from build-svg-sprite task to the preprocess-loader.
  // webpackConfig.module.rules[0].use.options.context.SVG_SPRITE_HASH = process.env.SVG_SPRITE_HASH

  webpack(webpackConfig, (err, stats) => {
    if (err) {
      console.error(err.stack || err)
      if (err.details) {
        console.error(err.details)
      }
      return
    }

    const info = stats.toJson()

    if (stats.hasErrors()) {
      console.error(info.errors)
    }

    if (stats.hasWarnings()) {
      console.warn(info.warnings)
    }

    // Log result...
    console.log(stats.toString({
      chunks: false, // Makes the build much quieter
      modules: false,
      colors: true, // Shows colors in the console
      moduleTrace: false
    }))

    browser.reload()

    done()
  })
}

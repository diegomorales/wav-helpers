const gulp = require('gulp')
const paths = require('./paths')
const fs = require('fs')

module.exports = function copyIndex () {
  const isProd = process.env.NODE_ENV === 'production'
  // const manifest = require('../build/rev-manifest')

  return gulp.src(paths.dev + 'index.html')
    .pipe(gulp.dest(function (file) {
      // let fileContent = file.contents.toString()
      //
      // for (const i in manifest) {
      //   if (Object.prototype.hasOwnProperty.call(manifest, i)) {
      //     if (isProd && i.includes('.css')) {
      //       // Inline CSS
      //       const regex = new RegExp(`<link.*${i}.*>`)
      //       let css = fs.readFileSync(paths.build + i).toString()
      //
      //       // Remove sourcemap reference.
      //       css = css.replace(/\/\*.*\*\//, '')
      //
      //       fileContent = fileContent.replace(regex, `<style>${css}</style>`)
      //     } else {
      //       fileContent = fileContent.replace(i, manifest[i])
      //     }
      //   }
      // }
      //
      // file.contents = Buffer.from(fileContent)

      return paths.build
    }))
}

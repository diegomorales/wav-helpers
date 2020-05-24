const paths = require('./paths')
const fs = require('fs')
const nunjucks = require('nunjucks')

module.exports = function copyIndex (done) {
  const isProd = process.env.NODE_ENV === 'production'
  const manifest = require('../build/rev-manifest')
  const env = nunjucks.configure(paths.devTemplates)
  let inlineStyle = ''

  if (isProd) {
    for (const i in manifest) {
      if (Object.prototype.hasOwnProperty.call(manifest, i)) {
        if (i.includes('.css')) {
          // Inline CSS
          inlineStyle = fs.readFileSync(paths.build + i).toString()

          // Remove sourcemap reference.
          inlineStyle = inlineStyle.replace(/\/\*.*\*\//, '')
        }
      }
    }
  }

  const rendered = env.render('index.njk', {
    manifest,
    isProd,
    inlineStyle
  })

  fs.writeFileSync(paths.build + 'index.html', rendered, 'utf8')

  done()

  // return gulp.src(paths.dev + 'index.html')
  //   .pipe(gulp.dest(function (file) {
  //     // let fileContent = file.contents.toString()
  //     //
  //     // for (const i in manifest) {
  //     //   if (Object.prototype.hasOwnProperty.call(manifest, i)) {
  //     //     if (isProd && i.includes('.css')) {
  //     //       // Inline CSS
  //     //       const regex = new RegExp(`<link.*${i}.*>`)
  //     //       let css = fs.readFileSync(paths.build + i).toString()
  //     //
  //     //       // Remove sourcemap reference.
  //     //       css = css.replace(/\/\*.*\*\//, '')
  //     //
  //     //       fileContent = fileContent.replace(regex, `<style>${css}</style>`)
  //     //     } else {
  //     //       fileContent = fileContent.replace(i, manifest[i])
  //     //     }
  //     //   }
  //     // }
  //     //
  //     // file.contents = Buffer.from(fileContent)
  //
  //     return paths.build
  //   }))
}

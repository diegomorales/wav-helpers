const paths = require('./paths')
const fs = require('fs')
const nunjucks = require('nunjucks')
const minify = require('html-minifier').minify

module.exports = function copyIndex (done) {
  const isProd = process.env.NODE_ENV === 'production'
  const manifest = require('../build/rev-manifest')
  const env = nunjucks.configure(paths.devTemplates)
  let inlineStyle = ''

  if (isProd) {
    for (const i in manifest) {
      if (Object.prototype.hasOwnProperty.call(manifest, i)) {
        if (i.includes('.css')) {
          // Get CSS
          inlineStyle = fs.readFileSync(paths.build + i).toString()

          // Remove sourcemap reference.
          inlineStyle = inlineStyle.replace(/\/\*.*\*\//, '')
        }
      }
    }
  }

  let rendered = env.render('index.njk', {
    manifest,
    isProd,
    inlineStyle
  })

  if (isProd) {
    // Minify HTML
    rendered = minify(rendered, {
      removeComments: true,
      collapseWhitespace: true,
      minifyJS: true
    })
  }

  fs.writeFileSync(paths.build + 'index.html', rendered, 'utf8')

  done()
}

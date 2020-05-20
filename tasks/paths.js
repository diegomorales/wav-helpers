module.exports = {
  dev: './src/',
  get devComponents () {
    return this.dev + 'components/'
  },
  get devPages () {
    return this.dev + 'pages/'
  },
  get devScss () {
    return this.dev + 'scss/'
  },
  get devJs () {
    return this.dev + 'js/'
  },
  get devAssets () {
    return this.dev + 'assets/'
  },
  build: './build/',
  get buildCss () {
    return this.build + 'css/'
  },
  get buildJs () {
    return this.build + 'js/'
  },
  get buildAssets () {
    return this.build + 'assets/'
  }
}

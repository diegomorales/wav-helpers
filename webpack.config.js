const paths = require('./tasks/paths')
const path = require('path')
const TerserPlugin = require('terser-webpack-plugin')

const isProd = process.env.NODE_ENV === 'production'

module.exports = {
  mode: process.env.NODE_ENV,
  watch: !isProd,
  devtool: isProd ? 'source-map' : 'eval-source-map',
  entry: {
    main: paths.devJs + 'main.js'
  },
  output: {
    publicPath: '/',
    filename: '[name].js',
    path: path.resolve(__dirname, paths.buildJs)
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        sourceMap: true,
        terserOptions: {
          compress: {
            drop_console: true
          }
        }
      })
    ]
  },
  resolve: {
    modules: ['node_modules', paths.devJs]
  }
}

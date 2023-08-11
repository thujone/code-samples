const path = require('path');
const merge = require('webpack-merge')
const baseConfig = require('./webpack.oneline-common.js')

module.exports = merge(baseConfig, {
    mode: 'development',
    devtool: 'inline-source-map',
    devServer: {
        port: 8082,
        host: "0.0.0.0",
        hot: true,
        liveReload: true,
        client: {
          overlay: {
            warnings: false,
            errors: false
          }
        },
        watchFiles: [ path.join(__dirname, 'src/**/*') ],
        static: {
            directory: path.join(__dirname, 'public'),
        },
        historyApiFallback: true
    },
    output: {
        filename: '[name].development.js',
        publicPath: 'http://localhost:8082/dist/'
    }
})